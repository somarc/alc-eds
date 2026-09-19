#!/usr/bin/env python3
"""DOM-based, local-only ALC homepage conversion. Requires beautifulsoup4.

Input is a captured public source document, not executable source scripts.
Output MUST be the external da-cli content workspace, never this Git checkout.
Upload and preview are deliberately separate, reviewed da-cli operations.
This reconstructs the initial source capture, not later author edits or the
demo-destination metadata. Do not replay it over the current DA documents blindly.
"""
import argparse
import copy
import datetime
import html
import json
import re
from pathlib import Path
from urllib.parse import quote, urljoin
from bs4 import BeautifulSoup

ORIGIN = 'https://www.alc.ca'
SOURCE = f'{ORIGIN}/content/alc/en.html'

def esc(value):
    return html.escape(str(value), quote=True)

def absolute(value):
    if value == '/content/alc/en.html':
        return '/'
    # The live winners carousel has an accidental doubled extension.
    value = value.replace('/winners.html.html', '/winners.html')
    return quote(urljoin(SOURCE, value), safe=':/?=&%+#@,;')

def text(node):
    return ' '.join(node.get_text(' ', strip=True).split()) if node else ''

def paragraph(value):
    return f'<p>{esc(value)}</p>'

def link(label, href):
    return f'<a href="{esc(absolute(href))}">{esc(label)}</a>'

def image(src, alt):
    return f'<p><picture><img src="{esc(absolute(src))}" alt="{esc(alt)}"></picture></p>'

def clean(node):
    if not node:
        return ''
    node = copy.deepcopy(node)
    for unwanted in node.select('script,style,button,input'):
        unwanted.decompose()
    for el in [node, *node.select('*')]:
        el.attrs = {k: v for k, v in el.attrs.items() if k in ['src', 'alt', 'href', 'colspan']}
        for attr in ['src', 'href']:
            if el.get(attr):
                el[attr] = absolute(el[attr])
    for span in node.select('span'):
        span.unwrap()
    return str(node)

def block(name, rows):
    return f'<div class="{name}">' + ''.join('<div>' + ''.join(f'<div>{c}</div>' for c in row) + '</div>' for row in rows) + '</div>'

def section(contents, style=''):
    metadata = block('section-metadata', [['style', ', '.join(style.split())]]) if style else ''
    return f'<div>{contents}{metadata}</div>'

def document(contents, title, description, snapshot):
    metadata = block('metadata', [['Title', title], ['Description', description], ['Robots', 'noindex, nofollow'], ['Source URL', SOURCE], ['Snapshot Date', snapshot]])
    return '<!doctype html><html><head></head><body><header></header><main>' + contents + section(metadata) + '</main><footer></footer></body></html>\n'

def background(el):
    match = re.search(r'url\([\"\']?(.*?)[\"\']?\)', el.get('style', ''))
    return match.group(1) if match else ''

def campaign_row(el, name):
    renditions = {n.get('data-media'): n.get('data-src') for n in el.select('[data-src]')}
    a = el.find('a', href=True) if el.name != 'a' else el
    return [image(renditions.get(f'(min-width: {w}px)', ''), name) for w in [1200, 768, 320]] + [paragraph('') if not a else '<p>' + link(name, a['href']) + '</p>']

def convert(source, output, snapshot, duplicate_winner_logo_url=None):
    source_html = source.read_text()
    soup = BeautifulSoup(source_html, 'html.parser')
    page_title = text(soup.title)
    custom_title = re.search(r'const customTitle = "((?:\\.|[^"\\])*)"', source_html)
    if custom_title:
        # Decode only the literal, never execute the source application's script.
        literal = re.sub(r'\\x([0-9a-fA-F]{2})', lambda m: '\\u00' + m[1], custom_title[1])
        page_title = json.loads('"' + literal + '"')
    home = [section('<h1>' + esc(page_title.split(' | ')[0]) + '</h1>', 'accessible-title')]
    mobile = soup.select_one('article.html-promo-full-link')
    if mobile:
        mobile_row = campaign_row(mobile, 'Winning numbers')
        home.append(section(block('promo-rail mobile-banner', [[mobile_row[2], mobile_row[3]]]), 'full-bleed mobile-only'))
    slides = soup.select('article.fca-carousel-slide-promo')
    assert len(slides) == 5, 'Source carousel changed: review the content model.'
    home.append(section(block('campaign-carousel', [campaign_row(s, s.get('data-gtm-name', 'Campaign')) for s in slides]), 'full-bleed'))
    home.append(section('<h2>Recent winners</h2>', 'title-band blue'))
    winners = []
    seen_logos = set()
    for item in soup.select('.winners-carousel-slides > .slide'):
        info = item.select_one('.winner-info')
        name = text(info.select_one('h3'))
        bio = '<h3>' + esc(name) + '</h3>' + paragraph(text(info.select_one('.h2')))
        a = info.find('a', href=True)
        bio += '<p><strong>' + link(text(a), a['href']) + '</strong></p>'
        logo = item.select_one('.winning-game-logo')
        logo_source = logo['src']
        if logo_source in seen_logos:
            if not duplicate_winner_logo_url:
                raise ValueError('Repeated winner logo: supply --duplicate-winner-logo-url with a separately uploaded DA asset path for independent Canvas replacement.')
            logo_source = duplicate_winner_logo_url
        seen_logos.add(logo['src'])
        game = image(logo_source, logo.get('alt', 'Winning game')) + paragraph(text(item.select_one('.winning-game-ribbon')))
        amount = re.sub(r'\D', '', text(item.select_one('.prize-amount')))
        groups = f'{int(amount):,}'.split(',')
        prize = '<p>' + ' '.join('<strong>' + ('$' if i == 0 else '') + g + '</strong>' for i, g in enumerate(groups)) + '</p>'
        winners.append([image(background(item.select_one('.winner-image')), name), bio, game, prize])
    assert len(winners) == 4
    home.append(section(block('winners', winners), 'full-bleed'))
    home.append(section('<h2>Featured games and promotions</h2>', 'title-band green'))
    cards = []
    for item in soup.select('article.game-tile'):
        content = item.select_one('.game-tile-content')
        title = text(content.select_one('h3'))
        body = '<h3>' + esc(title) + '</h3>' + clean(content.select_one('.game-tile-description p'))
        next_draw = item.get('data-next-draw-date')
        if next_draw:
            date = datetime.datetime.fromtimestamp(int(next_draw[:13]) / 1000, datetime.timezone(datetime.timedelta(hours=-3)))
            body += paragraph('Next Draw: ' + date.strftime('%a. %d %b. %Y'))
            body += paragraph(text(content.select_one('.next-jackpot-prize')))
        a = content.select_one('a.button')
        body += '<p><strong>' + link(text(a), a['href']) + '</strong></p>'
        media = image(background(item.select_one('.game-tile-image-container')), title)
        overlay = ''
        if item.select_one('.jackpot-lottomax'):
            overlay = paragraph(text(item.select_one('.prize-bar'))) + paragraph(text(item.select_one('.max-plus-bar')))
        if item.select_one('.jackpot-lotto649'):
            overlay = paragraph(text(item.select_one('.prize-bar'))) + image('/content/dam/alc/images/Homepage/GOLD_BALL_EN.png', 'Gold Ball Jackpot')
        if item.select_one('.game-flag.new'):
            overlay = paragraph('New')
        cards.append([media, body, overlay])
    assert len(cards) == 7
    rail = []
    selector = '.cmp-container--game-tiles + .alc-container .cmp-image'
    for i, promo in enumerate(soup.select(selector)):
        a = promo.find('a', href=True)
        picture = promo.find('picture')
        sources = {n.get('media'): n.get('srcset') for n in picture.select('source')}
        labels = ['Daily Grand', 'Magnetic World Music Festival', 'Social Purpose', 'Discover our site']
        rail.append([image(sources[f'(min-width: {w}px)'], labels[i]) for w in [1200, 768, 320]] + ['<p>' + link(labels[i], a['href']) + '</p>'])
    assert len(rail) == 4
    home.append(section(block('game-cards', cards) + block('promo-rail', rail), 'featured-layout'))

    # Four columns in the top row, four primary navigation cells in the second.
    top = [image('/content/dam/alc/images/static/game-tiles/ALC-header-logo-en.png', 'Atlantic Lottery') + image('/content/dam/alc/images/static/game-tiles/ALC-header-logo-bug.png', 'Atlantic Lottery symbol'),
           '<p>' + link('Search', '/content/alc/en/search-results.html') + '</p>',
           '<p>' + link('Français', '/content/alc/fr.html') + ' ' + link('Help', '/content/alc/en/referenced-content/external/help-redirect.html') + ' ' + link('Create Account', '/content/alc/en/registration/register-account.html') + ' ' + link('Shopping Cart', '/content/alc/en/cart.html') + '</p>',
           '<p>' + link('Sign In', '/content/alc/en.html') + '</p>']
    # Only the logo is linked home. Sign In deliberately leaves the migration preview.
    top[0] = top[0].replace('<picture>', '<a href="/"><picture>').replace('</picture>', '</picture></a>')
    top[3] = '<p><a href="https://www.alc.ca/content/alc/en.html">Sign In</a></p>'
    nav = []
    for item in soup.select('.header-nav ul.yamm > li'):
        a = item.find('a', recursive=False)
        if not a:
            continue
        label = text(a)
        cell = '<p>' + link(label, a['href']) + '</p>'
        primary = item.select_one('.game-list-primary')
        if primary:
            entries = []
            for child in primary.find_all('li', recursive=False):
                logo_a = child.select_one('a.game-logo')
                if not logo_a:
                    continue
                im = logo_a.find('img')
                label_a = child.select_one('a.button')
                entries.append('<li>' + (image(im['src'], im.get('alt', '')) if im else '') + '<p>' + link(logo_a.get('title', text(logo_a)), logo_a['href']) + '</p>' + ('<p><strong>' + link(text(label_a), label_a['href']) + '</strong></p>' if label_a else '') + '</li>')
            cell += '<ul>' + ''.join(entries) + '</ul>'
        secondary = item.select_one('.game-list-secondary')
        if secondary:
            cell += '<ul>' + ''.join('<li>' + link(text(a), a['href']) + '</li>' for a in secondary.select('a[href]')) + '</ul>'
        nav.append(cell)
    assert len(nav) == 4

    footer = soup.select_one('footer.main-footer')
    prompt = text(footer.select_one('.footer-subscribe .email p'))
    newsletter = [paragraph(prompt), '<p><a href="https://www.alc.ca/content/alc/en.html#emailCollection">Subscribe</a></p>']
    social = ['<p>' + link('Contact Us', '/content/alc/en/corporate/about-atlantic-lottery/contact-us.html') + '</p>',
              '<p>Follow us on: ' + link('Facebook', 'https://www.facebook.com/atlanticlottery') + ' ' + link('Instagram', 'https://www.instagram.com/atlanticlottery') + '</p>',
              '<p>' + link('Leave a Comment', '/content/alc/en/corporate/about-atlantic-lottery/contact-us.html') + '</p>',
              image('/content/dam/alc/images/Footer/19Knowyourlimit-en.jpg', '19+ Know your limit. Play within it.')]
    groups = []
    for group in footer.select('.links.hidden-xs > .col-sm-3'):
        heading = group.find('h1')
        h = clean(heading).replace('<h1>', '<h3>').replace('</h1>', '</h3>')
        intro = group.find('h2')
        if intro:
            h += paragraph(text(intro))
        groups.append(h + clean(group.find('ul')))
    assert len(groups) == 4
    misc = footer.select_one('.misc')
    policies = ''.join(clean(p) for p in misc.select('p') if p.find('a'))
    copy_fields = []
    for p in misc.select('p'):
        value = text(p)
        if value.startswith(('You must be 19+', '© Copyright')) and value not in copy_fields:
            copy_fields.append(value)
    # Partner and certification art are source images; always remain DA-authored.
    partners = clean(misc.select_one('.other-sites h3')) + '<p>' + ' '.join('<a href="'+esc(absolute(a['href']))+'">'+clean(a.find('img'))+'</a>' for a in misc.select('.other-sites a')) + '</p>'
    certs = '<p>' + ''.join(clean(im) for im in misc.select('img') if 'logo-rgcheck' in im.get('src','') or 'logo-wla' in im.get('src','')) + '</p>'
    copyright_copy = ''.join(paragraph(value) for value in copy_fields)
    copyright_copy += paragraph(f'Migration preview · Source snapshot {snapshot}. Not the official Atlantic Lottery site. Draws and prizes are dated reference content, not live results. Account, play, search and subscription links continue on alc.ca; no account or payment data is collected here.')
    legal = [partners, policies, certs, copyright_copy]
    documents = {
        'index.html': document(''.join(home), page_title, soup.select_one('meta[name="description"]').get('content',''), snapshot),
        'nav.html': document(section(block('navigation', [top, nav]), 'full-bleed'), 'Navigation', 'ALC migration shared navigation.', snapshot),
        'footer.html': document(section(block('site-footer', [newsletter, social, groups, legal]), 'full-bleed'), 'Footer', 'ALC migration shared footer.', snapshot),
    }
    for name, contents in documents.items():
        (output / name).write_text(contents)
    return {'source': SOURCE, 'capturedDate': snapshot, 'documents': list(documents), 'counts': {'campaignSlides': len(slides), 'winners': len(winners), 'gameCards': len(cards), 'promotions': len(rail)}, 'linkCorrection': 'winners.html.html -> winners.html', 'runtimePolicy': 'Dated editorial reference only; all account/play actions remain outbound. No live or transactional parity claimed.'}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--snapshot', required=True)
    parser.add_argument('--duplicate-winner-logo-url')
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[1]
    target = args.output.resolve()
    if target.is_relative_to(repo):
        parser.error('DA content belongs in the external operational workspace, not Git.')
    target.mkdir(parents=True, exist_ok=True)
    print(json.dumps(convert(args.source, target, args.snapshot, args.duplicate_winner_logo_url), indent=2))

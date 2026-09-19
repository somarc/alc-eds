"""Regression tests for the migration boundary; no maintained DA content fixtures."""
import importlib.util
from pathlib import Path
import unittest
from bs4 import BeautifulSoup

SPEC = importlib.util.spec_from_file_location('importer', Path(__file__).parents[1] / 'tools' / 'import-homepage.py')
IMPORTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(IMPORTER)


class ImportBoundaryTests(unittest.TestCase):
    def test_section_styles_are_comma_separated(self):
        html = IMPORTER.section('<h2>Test</h2>', 'title-band blue')
        soup = BeautifulSoup(html, 'html.parser')
        self.assertEqual(soup.select_one('.section-metadata > div > div:last-child').text, 'title-band, blue')

    def test_one_metadata_channel(self):
        html = IMPORTER.document(IMPORTER.section('<p>Test</p>'), 'Title', 'Description', '2026-09-18')
        soup = BeautifulSoup(html, 'html.parser')
        self.assertFalse(soup.html.has_attr('lang'))
        self.assertFalse(soup.head.select('title,meta'))
        self.assertEqual(len(soup.select('.metadata')), 1)
        self.assertEqual(soup.select_one('.metadata').parent.parent.name, 'main')

    def test_url_boundary(self):
        self.assertEqual(IMPORTER.absolute('/content/alc/en.html'), '/')
        self.assertEqual(IMPORTER.absolute('/content/alc/en/cart.html'), 'https://www.alc.ca/content/alc/en/cart.html')
        self.assertIn('winners.html', IMPORTER.absolute('/content/alc/en/corporate/are-you-a-winner/winners.html.html'))
        self.assertNotIn('.html.html', IMPORTER.absolute('/winners.html.html'))

    def test_text_and_attributes_are_escaped(self):
        picture = BeautifulSoup(IMPORTER.image('/image one.png', 'A "quoted" image'), 'html.parser')
        self.assertEqual(picture.img['alt'], 'A "quoted" image')
        self.assertEqual(picture.img['src'], 'https://www.alc.ca/image%20one.png')
        self.assertEqual(IMPORTER.paragraph('<script>'), '<p>&lt;script&gt;</p>')

    def test_legacy_application_code_is_not_imported(self):
        source = BeautifulSoup('<div onclick="run()"><script>run()</script><p data-bind="runtime">Author text</p></div>', 'html.parser')
        result = BeautifulSoup(IMPORTER.clean(source.div), 'html.parser')
        self.assertFalse(result.select('script,[onclick],[data-bind]'))
        self.assertEqual(result.p.text, 'Author text')


if __name__ == '__main__':
    unittest.main()

# Google Images Scraper

Google images scraper for downloading the top _k_ images of your choice given query text (written in Python).


### Example usage

Run

```
python3 scrape_google_images.py
```

with parameters

```
query_text = "drake"  # google images query text
k = 5  # top k images will be scraped
output_dir = "output"  # output directory to save images
dt_wait = 1  # number of seconds to wait between image scrapes
```

gives

```
Querying Google Images for 'drake'  ->  saving top 5 images into 'output'
[1/10] Downloading image: 'output/drake-1.jpg'...
[2/10] Downloading image: 'output/drake-2.jpg'...
[3/10] Downloading image: 'output/drake-3.jpg'...
[4/10] Downloading image: 'output/drake-4.jpg'...
[5/10] Downloading image: 'output/drake-5.jpg'...
```

with the scraped images saved to the `output` directory.

### Libraries

* BeautifulSoup, urllib

### Authors

Anson Wong
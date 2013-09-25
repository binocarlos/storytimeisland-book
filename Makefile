build: index.js templates/book.js templates/gallery.js components
	@component build

templates/book.js: templates/book.html
	@component convert $<

templates/gallery.js: templates/gallery.html
	@component convert $<

templates/gallerypage.js: templates/gallerypage.html
	@component convert $<	

components:
	@component install

clean:
	rm -fr build components

.PHONY: clean
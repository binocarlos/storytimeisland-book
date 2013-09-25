build: index.js templates/book.js components
	@component build

templates/book.js: templates/book.html
	@component convert $<

components:
	@component install

clean:
	rm -fr build components

.PHONY: clean
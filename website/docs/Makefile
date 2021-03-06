#!/bin/bash
SRC := $(shell node read_sidebar.js)
SRC_FILES := $(filter-out combined_pdf.md combined.md pdfcombined.md introduction.md, $(SRC))
COMMITSHA := $(shell git rev-parse --short HEAD)
TITLE := $(shell sed -e 's/git-commit-sha/git revision $(COMMITSHA)/' title.md > titlemod.md)

all: copymd md pdf realpdf

pdf: copymd $(SRC_FILES)
	@for f in $(SRC_FILES); do cat $${f} | node tex_parser.js; done > pdfcombined.md

realpdf: pdf
	pandoc titlemod.md pdfcombined.md --listings -H listings.tex  --toc -o jbrowse2.pdf

copymd:
	cp ../../products/jbrowse-cli/README.md cli.md

md: copymd $(SRC_FILES)
	@(echo '---\ntitle: JBrowse 2 combined guide\nid: combined\n---\n\nThis document is a collection of all our documentation. It includes our quick start guide, user guide, configuration guide, CLI guide, developer guide, and FAQ. You can browse the other documents individually, but this page is to help simple ctrl+f searching and easy browsing. You can also download a pdf version of these same docs located at https://jbrowse.org/jb2/jbrowse2.pdf\n\n' && for f in $(SRC_FILES); do cat $${f} | node md_parser.js; done) > combined.md

.PHONY: all


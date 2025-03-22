build:
	npm run build

develop:
	npm run develop

publish: build
	git checkout master
	git rm $$(git ls-files -- ':!.gitignore')
	cp -R out/* ./
	git add .
	@echo "Go ahead, commit and push the changes"

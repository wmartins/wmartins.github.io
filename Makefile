build:
	npm run build

clean:
	npm run clean

develop:
	npm run develop

publish: clean build
	git checkout master
	git rm $$(git ls-files -- ':!.gitignore')
	cp -R public/* ./
	git add .
	@echo "Go ahead, commit and push the changes"

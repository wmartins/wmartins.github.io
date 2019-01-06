build:
	hugo

publish: build
	git checkout master
	git rm $$(git ls-files -- ':!.gitignore')
	cp -R public/* ./
	git add .
	@echo "Go ahead, commit and push the changes"

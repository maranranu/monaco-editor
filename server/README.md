# monaco-editor-server
Monaco editor language server

Python version: 3.*

Install python-language-server and rope package
- ``` pip install python-language-server rope```

For extra features like docstyle or linting install pycodestyle, pydocstyle, autopep8


pyls has lots of other python packages which supports extra features like linting, autocompletion, etc... 
- Rope for Completions and renaming
- Pyflakes linter to detect various errors
- McCabe linter for complexity checking
- pycodestyle linter for style checking
- pydocstyle linter for docstring style checking (disabled by default)
- autopep8 for code formatting
- YAPF for code formatting (preferred over autopep8)
- pyls-mypy Mypy type checking for Python 3
- pyls-isort Isort import sort code formatting
- pyls-black for code formatting using Black

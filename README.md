# Gabriel Dall'Alba's Personal Website

Welcome to the repository for my personal academic website! This website serves as a hub for all my professional activities, research interests, publications, teaching experience, and outreach efforts.

## About the Website

This site features:

- Information about my research and academic background
- Publications and scholarly contributions
- Teaching experience and philosophy
- Science communication and outreach activities
- Regular newsletters on topics like bioinformatics and critical thinking

## Visit My Website

You can access my website at [gdalba.github.io](https://gdalba.github.io)

## Technical Details

This website is built using Jekyll and GitHub Pages, with a responsive design that works well on desktop and mobile devices. The site is regularly updated with new content, publications, and outreach activities.

I am not knowledgeable on things such as javascript or html, portions of this website have been supported heavily by AI-assisted coding. Mainly [Claude 3.7 Sonnet](https://www.anthropic.com/news/claude-3-7-sonnet).

### Convert Excel to Json

I developed a python script that reads an excel file as input, and outputs a JSON file that is then supplied to my `teaching_viz.js` module. It reads multiple sheets from the Excel file (covering courses, teaching assistant and lecturer evaluations, and student comments) then aggregates the data by course, year, and term. The script normalizes metric names, safely handles missing or malformed data, and organizes the output so that each course contains its associated years, role, and a list of evaluations (including metrics and comments). It features robust input validation, logging, and even manages the required Conda environment for dependencies.

Usage:

```python
python convert_excel_to_json.py -i <input file.xlsx> -o <output file name.json> -c <conda env name>
```

## Acknowledgements

The website is based on the [academic-homepage](https://github.com/luost26/academic-homepage) template, which has been customized to suit my needs. Many thanks to the original creator of this excellent template!

This version would not exist without the commitment and effort of [Sara Zhang](https://saraz9.github.io/). She is the most intelligent and capable person I have ever known. I am deeply grateful for her.

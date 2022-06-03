# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Batuhan Faik Derinbay | 340560 |
| Maciej Styczen | 331214 |
| Nevena Drešević | 321682 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1

[Milestone 1 report](https://github.com/com-480-data-visualization/datavis-project-2022-why-axis/blob/main/milestone1.md)

## Milestone 2

[Milestone 2 report](https://github.com/com-480-data-visualization/datavis-project-2022-why-axis/blob/main/milestone2.pdf)

Website: https://com-480-data-visualization.github.io/datavis-project-2022-why-axis/

## Milestone 3

[Process Book](https://github.com/com-480-data-visualization/datavis-project-2022-why-axis/blob/main/ProcessBook.pdf)

Screencast: https://youtu.be/t7a9g44fBnk

Website: https://com-480-data-visualization.github.io/datavis-project-2022-why-axis/

## Dataset
The data is available on [data.europa.eu](https://data.europa.eu/data/datasets/erasmus-mobility-statistics-2014-2019-v2?locale=en).

## Instructions on Cloning the Website
The website is hosted on GitHub pages and is accessible via [this](https://com-480-data-visualization.github.io/datavis-project-2022-why-axis/) link.
If you would like to work on the source, the website is stored in the `docs` directory within this repository and the steps to run your server locally are as follows:
- Clone the repo

  `git clone git@github.com:com-480-data-visualization/datavis-project-2022-why-axis.git`
- Change directory into `docs` folder

  `cd datavis-project-2022-why-axis/docs`
- Start the webserver either by running `python -m http-server` or by using VSCode/IntelliJ respective extensions for starting webservers
- Visit the website at `localhost:8000`
  - Keep in mind that the port is subject to change depending on the extension

The folder structure of the website is as follows:
```
docs
├── css (Stylesheets)
├── data (Data used in visualizations)
├── images (Images used in the website)
├── js (JavaScript files of the website and visualizations)
├── *.png (Icons for respective devices)
├── favicon.ico (Favicon of the websites)
├── index.html (The one-pager entry template)
└── site.webmanifest (Web manifest)
```

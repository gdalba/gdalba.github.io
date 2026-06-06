---
title: "Making connections between evolutionary concepts: a case study using the Pacific field cricket, Teleogryllus oceanicus"
date_range: "2025"
image: "/assets/images/outreach/poster25.jpg"
category: "talks"
excerpt: "A presentation at UBC Biology Teaching & Learning Retreat 2025."
links:
  - name: "Download Poster (PDF)"
    url: "/assets/pdfs/posters/TeachingRetreatSlide_2025_final_LizelleOdendaal.pdf"
---

## Introduction

<a href="#the-poster" class="btn btn-primary">If you want to skip to the Poster, click this button! It will take you to the bottom of the page.</a>

During my *Thinking Like a Life Scientist* (BIOL 180) teaching, I used a very cool case study from the Pacific field crickets throughout the course. I then introduced this system to [Dr. Lizelle Odendaal](https://zoology.ubc.ca/person/lizelle-odendaal), the coordinator for *Fundamentals of Evolutionary Biology* (BIOL 336) at UBC and a good friend. In a characteristically brilliant move, she developed an activity that engages students in connecting evolutionary concepts across the field of evolutionary biology. I will keep it brief here, but the activity works as follows:

- Students form groups of up to four individuals.
- They are given prompts that present the system in increasing levels of complexity.
- They are given time to discuss the content of the prompt, then move on to the next.

Here's the catch: each prompt draws from a different domain within evolutionary biology! Students move from dispersal to sexual selection, to mutation and drift, to adaptation and species concepts, and more. Moreover, each prompt greatly benefits from being discussed in the context of the previous ones (i.e., information from one prompt helps inform the next).

<div style="display: flex; justify-content: center; margin-bottom: 20px;">
    <figure style="width: 100%;">
        <img src="\assets\images\outreach\lizelle_activity.jpg" alt="Prompts from the activity." style="width: 100%;">
        <figcaption style="text-align: center; font-style: italic;">Examples of prompts sudents are given in class during the activity. Courtesy of Dr. Lizelle Odendaal.</figcaption>
    </figure>
</div>

## Why are we doing this?

Evolutionary Biology is, as famously put by Dobzhansky, the lens through which all biology makes sense. As educators, we recognize that this field of knowledge cannot be truly understood by simply memorizing definitions and examples within isolated topics (e.g., treating sexual selection as entirely separate from natural selection, or ignoring mutations and their implications on traits that, in turn, might influence selection). It is essential to understand that a good biologist (evolutionary or otherwise) is not the one who memorizes the most concepts, but the one who *thinks evolutionarily*.

This is precisely why the activity is discussion-based: it mirrors what we often do on a Wednesday afternoon, puzzling over the data we’re collecting in our own research. It encourages students to think like scientists, actively building connections between ideas.

## Surveys

The creation of this activity provided a valuable opportunity to gather data. Over two different terms, we asked students to complete pre- and post-activity surveys. Our goals were twofold: first, to gather exploratory data on which topics students struggle to **think about** — specifically, which concepts they fail to relate beyond their immediate context; and second, to assess whether the activity helps address this limitation by encouraging broader evolutionary thinking. In this approach, concepts become cognitive tools rather than ends in themselves. Details and results are presented in the poster below.

### Data analysis

With Lizelle's collaboration and insights, I led the data collection. I took inspiration in the publications of our phenomenal colleague [Dr. Bridgette Clarkston](https://botany.ubc.ca/people/bridgette-clarkston/) for the formulation of the surveys. I then created a pipeline that takes as input one or more pre- and post-activity surveys taken with Qualtrics, and outputs a series of tables and plots for analysis and discussion by the teaching team. A few highlights:

- Uses [Snakemake](https://snakemake.readthedocs.io/en/stable/) for workflow management.
- Uses Natural Language Processing (NLP) for automatic processing of students' answers. If you are interested in ChatGPT and other Large Language Models (LLMs), then know that NLP is the foundational domain of knowledge of such technologies. In particular, I used a good-for-clustering model called [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) to transform data into input for [K-means clustering](https://www.geeksforgeeks.org/machine-learning/k-means-clustering-introduction/).
- Draws inspiration from Marlene Zuk and colleagues in [this paper about sexual signal loss on crickets](https://besjournals.onlinelibrary.wiley.com/doi/10.1111/1365-2656.12806) to plot a comparison of pre- and post-activity confidence scores against a 1:1 baseline (i.e., no change in confidence).

We presented our preliminary data analysis at the fantastic UBC Biology Teaching & Learning Retreat 2025 hosted by [Dr. Christine Goedhart](https://www.linkedin.com/in/christine-goedhart-38199167), [Dr. Gwen Huber](https://www.linkedin.com/in/gwen-huber-5616ba54/), and supported by [Dr. Pamela Kalas](https://zoology.ubc.ca/person/pamela-kalas).

GitHub of the project: TBA


<div style="display: flex; justify-content: center; margin-bottom: 20px;">
    <figure style="width: 100%;">
        <img src="\assets\images\outreach\cluster_data_Pre_Q1_categories.png" alt="K-Means." style="width: 100%;">
        <figcaption style="text-align: center; font-style: italic;">K-means clusters with pre-defined centroids (labeled as categories in this case, representing main topics in evo bio. Reduced dimensions to two with PCA analysis and plotted.</figcaption>
    </figure>
</div>

<div class="mt-4">
  <h4 id="the-poster">The Poster</h4>
  <div class="embed-responsive embed-responsive-16by9">
    <object class="embed-responsive-item" data="{{ '/assets/pdfs/posters/TeachingRetreatSlide_2025_final_LizelleOdendaal.pdf' | relative_url }}" type="application/pdf">
      <p>It appears your browser doesn't support embedded PDFs. 
      <a href="{{ '/assets/pdfs/posters/TeachingRetreatSlide_2025_final_LizelleOdendaal.pdf' | relative_url }}">Download the PDF</a> instead.</p>
    </object>
  </div>
</div>
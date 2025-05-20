---
title: "Cover and Art Design for E-book “Sustainable paths and scientific education in Elementary School”"
date_range: "2019"
image: "/assets/images/outreach/caminhos.jpg"
category: "community-engagement"
excerpt: "I created the visual artwork for this fantastic book!"
links:
  - name: "Download the book here!"
    url: "https://www.ucs.br/educs/livro/caminhos-sustentaveis-e-a-educacao-cientifica-no-ensino-fundamental/"
gallery:
  - image_path: /assets/images/outreach/caminhos.jpg
    alt: "Cover"
    title: "Book Cover"
  - image_path: /assets/images/outreach/caminhos2.jpg
    alt: "Chapter 1 companion art"
    title: "Chapter 1 companion art (Is sustainability sustainable?)"
  - image_path: /assets/images/outreach/caminhos3.jpg
    alt: "Chapter 2 companion art"
    title: "Chapter 2 companion art (Pedagogical action strategies)"
  - image_path: /assets/images/outreach/caminhos6.jpg
    alt: "Chapter 5 companion art"
    title: "Chapter 5 companion art (Electronic waste)"
  - image_path: /assets/images/outreach/caminhos4.jpg
    alt: "Chapter 7 companion art"
    title: "Chapter 7 companion art (The water that flows through our lives!)"
  - image_path: /assets/images/outreach/caminhos5.jpg
    alt: "Chapter 9 companion art"
    title: "Chapter 9 companion art (Functional foods, probiotics, and their importance in sustainability)"
---

Invited by the organizer, Prof. Dr. Cláudia Pinto Machado, I was in charge of the visual artwork that accompanies every chapter, as well as the cover art. This book is dedicated to teaching practices about sustainability for K-12 education.

I identified a common art style I was comfortable with and that would easily convey the message of every chapter. Below you can see some examples.

## Gallery

<div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
{% for img in page.gallery %}
  <div style="width: 31%; margin-bottom: 15px;">
    <a href="{{ img.image_path | relative_url }}">
      <img src="{{ img.image_path | relative_url }}" alt="{{ img.alt }}" style="width: 100%; height: auto;">
    </a>
    <p style="font-size: 0.8em; text-align: center;">{{ img.title }}</p>
  </div>
{% endfor %}
</div>


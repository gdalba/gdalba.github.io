---
title: "3rd High School Fair of Flores da Cunha city”"
date_range: "2016"
image: "/assets/images/outreach/schoolfair3.jpg"
category: "community-engagement"
excerpt: "Shared a bit of my journey, shortly after returning from Canada!"
#links:
#  - name: "Download the book here!"
#    url: "https://www.ucs.br/educs/livro/caminhos-sustentaveis-e-a-educacao-cientifica-no-ensino-fundamental/"
gallery:
  - image_path: /assets/images/outreach/schoolfair.jpg
    alt: "Cover"
    #title: "Book Cover"
  - image_path: /assets/images/outreach/schoolfair2.jpg
    alt: "Cover"
    #title: "Book Cover"
  - image_path: /assets/images/outreach/schoolfair3.jpg
    alt: "Cover"
    #title: "Book Cover"
  - image_path: /assets/images/outreach/schoolfair4.jpg
    alt: "Cover"
    title: "Besides me is my High School Chemistry teacher, Prof. Lilian Guerra Pedruzzi, whom I admire a great lot."

---

Invited by my High School (La Salle), I traveled to my mother's hometown, [Flores da Cunha](https://en.wikipedia.org/wiki/Flores_da_Cunha), to talk to High School Students about my ongoing studies at the Undergraduate level. Timing was fortuitous, as I had returned from my trip to Canada to present my work in the Canada International Conference on Education (CICE) 2016.

The event was aimed at students completing elementary school and their families, beginning with a lecture on vocational guidance by psychologist Ana Cecília Santiago.

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


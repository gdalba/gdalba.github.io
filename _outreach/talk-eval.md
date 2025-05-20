---
title: "How to evaluate scientific information on the Internet?"
date_range: "2017"
image: "/assets/images/outreach/pal1.png"
category: "talks"
excerpt: "A talk to High School classrooms from the beautiful city of Antônio Prado (Brazil) "
#links:
#  - name: "Download the book here!"
#    url: "https://www.ucs.br/educs/livro/caminhos-sustentaveis-e-a-educacao-cientifica-no-ensino-fundamental/"
gallery:
  - image_path: /assets/images/outreach/pal4.jpg
    alt: "Cover"
    #title: "Book Cover"
  - image_path: /assets/images/outreach/pal2.jpg
    alt: "Chapter 1 companion art"
    #title: "Chapter 1 companion art (Is sustainability sustainable?)"
  - image_path: /assets/images/outreach/pal3.jpg
    alt: "Chapter 2 companion art"
    #title: "Chapter 2 companion art (Pedagogical action strategies)"

---

Teaming up with star colleagues and friends David Mondoloni, Dr. Eduardo Echer dos Reis, Dr. Johnatan Vilasboa, and Dr. Guilherme Brambatti Guzzo, we took the invitation from the Municipal Department of Education and Culture of the charming [Antônio Prado city](https://en.wikipedia.org/wiki/Ant%C3%B4nio_Prado) to talk about misinformation and how to navigate it on the Internet.

Key points:

- You will find more misinformation than actual information.
- Identify your experts: if something sounds the alarm in your mind, know where to go to fact check.
- The Internet will create a bubble around you, if you feed yourself with too much misinformation, misinformation is all that will show around you.

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

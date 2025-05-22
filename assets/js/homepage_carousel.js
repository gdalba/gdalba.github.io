document.addEventListener('DOMContentLoaded', function() {
  console.log("Loading homepage comments carousel");
  
  // Fetch teaching evaluation data
  fetch('/assets/data/teaching_evaluations.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data || !data.courses || !Array.isArray(data.courses)) {
        throw new Error('Invalid data format');
      }
      
      // Initialize the comments carousel
      initializeCommentsCarousel(data.courses);
    })
    .catch(error => {
      console.error("Error loading evaluation data for comments:", error);
      const carousel = document.getElementById('homepage-comments-carousel');
      if (carousel) {
        carousel.innerHTML = `<div class="alert alert-danger">Error loading comments: ${error.message}</div>`;
      }
    });
});

function initializeCommentsCarousel(courses) {
  const carouselContainer = document.getElementById('homepage-comments-carousel');
  if (!carouselContainer) {
    console.error("Homepage comments carousel container not found");
    return;
  }
  
  // Extract all comments from all courses
  const allComments = [];
  
  courses.forEach(course => {
    if (!course.evaluations || !Array.isArray(course.evaluations)) return;
    
    course.evaluations.forEach(evaluation => {
      if (!evaluation.comments || !Array.isArray(evaluation.comments)) return;
      
      evaluation.comments.forEach(comment => {
        if (!comment) return;
        
        allComments.push({
          text: comment,
          course: course.id,
          name: course.name,
          role: course.role || 'Instructor',
          year: evaluation.year,
          term: evaluation.term || ''
        });
      });
    });
  });
  
  if (allComments.length === 0) {
    carouselContainer.innerHTML = '<div class="alert alert-info">No student comments available.</div>';
    return;
  }
  
  // Shuffle comments for variety
  shuffleArray(allComments);
  
  // Limit to a reasonable number (e.g., 20)
  const selectedComments = allComments.slice(0, 20);  

  // Create carousel HTML
  const carouselHTML = `
    <div class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title text-center">What Students Say</h5>
        <div id="homepageCommentsCarousel" class="carousel slide" data-ride="carousel" data-interval="10000">
          <div class="carousel-inner">
            ${selectedComments.map((comment, index) => `
              <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <div class="p-4">
                  <blockquote class="blockquote">
                    <p class="mb-0">"${escapeHTML(comment.text)}"</p>
                    <footer class="blockquote-footer text-right">
                      ${comment.course}: ${comment.name} (${comment.term} ${comment.year}) 
                      <br><small>${getRoleDisplay(comment.role)}</small>
                    </footer>
                  </blockquote>
                </div>
              </div>
            `).join('')}
          </div>
          <a class="carousel-control-prev" href="#homepageCommentsCarousel" role="button" data-slide="prev" style="width: 5%;">
            <span class="carousel-control-prev-icon bg-secondary rounded-circle p-2" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
          </a>
          <a class="carousel-control-next" href="#homepageCommentsCarousel" role="button" data-slide="next" style="width: 5%;">
            <span class="carousel-control-next-icon bg-secondary rounded-circle p-2" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
          </a>
          <ol class="carousel-indicators position-relative mt-2">
            ${selectedComments.map((_, index) => `
              <li data-target="#homepageCommentsCarousel" data-slide-to="${index}" ${index === 0 ? 'class="active"' : ''}></li>
            `).join('')}
          </ol>
        </div>
        <div class="text-center mt-3">
          <a href="/teaching#section-data-viz" class="text-primary">Want to see more? Check out the teaching evaluations data visualization!</a>
        </div>
      </div>
    </div>
  `;
  
  // Add the carousel to the container
  carouselContainer.innerHTML = carouselHTML;
  
  // Initialize the carousel
  try {
    if (typeof $ !== 'undefined') {
      $('#homepageCommentsCarousel').carousel();
    }
  } catch (e) {
    console.warn('Could not initialize homepage carousel', e);
  }
}

// Helper function to shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Helper function to escape HTML
function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper function to display role in a more friendly format
function getRoleDisplay(role) {
  if (!role) return '';
  
  if (role.toLowerCase().includes('lecturer')) {
    return 'As Lecturer';
  } else if (role.toLowerCase().includes('assistant') || role.toLowerCase().includes('ta')) {
    return 'As Teaching Assistant';
  }
  
  return role;
}
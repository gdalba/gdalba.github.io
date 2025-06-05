// Simple caching and state management
const chartInstances = {};
const state = {
  lecturer: { selectedCourse: null, selectedYear: null },
  ta: { selectedCourse: null, selectedYear: null }
};
const chartWrapper = document.createElement('div');
chartWrapper.style.height = '800px'; // Fixed height
chartWrapper.style.maxHeight = '70vh'; // Responsive but limited
chartWrapper.style.overflow = 'auto'; // Allow scrolling for many questions

document.addEventListener('DOMContentLoaded', function() {
  console.log("Document loaded, starting visualization setup");
  
  // Add debug checks for required libraries
  console.log("Chart.js available:", typeof Chart !== 'undefined');
  console.log("jQuery available:", typeof jQuery !== 'undefined' || typeof $ !== 'undefined');
  
  // Fetch teaching evaluation data
  fetch('/assets/data/teaching_evaluations.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Loaded evaluation data:", data);
      
      if (!data || !data.courses || !Array.isArray(data.courses)) {
        throw new Error('Invalid data format');
      }
      
      // Simple role filtering
      const roles = {
        lecturer: data.courses.filter(c => c.role && c.role.toLowerCase().includes('lecturer')),
        ta: data.courses.filter(c => c.role && (c.role.toLowerCase().includes('assistant') || c.role.toLowerCase().includes('ta')))
      };
      
      console.log("Filtered roles:", roles);
      
      // Initialize each section if it has data
      Object.entries(roles).forEach(([role, courses]) => {
        if (courses.length > 0) {
          setupSection(role, courses);
        } else {
          const container = document.getElementById(role);
          if (container) {
            container.innerHTML = '<div class="alert alert-info">No evaluation data available for this role.</div>';
          }
        }
      });
    })
    .catch(error => {
      console.error("Error loading evaluation data:", error);
      document.querySelectorAll('#lecturer, #ta').forEach(el => {
        el.innerHTML = `<div class="alert alert-danger">Error loading evaluation data: ${error.message}</div>`;
      });
    });
});

function setupSection(role, courses) {
  console.log(`Setting up ${role} section with ${courses.length} courses`);
  
  // Setup course selector
  const courseSelector = document.getElementById(`${role}-course-selector`);
  if (!courseSelector) {
    console.error(`Course selector #${role}-course-selector not found`);
    return;
  }
  
  // Clear existing options
  courseSelector.innerHTML = '';
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.textContent = '-- Select a course --';
  defaultOption.value = '';
  courseSelector.appendChild(defaultOption);
  
  // Add course options
  courses.forEach(course => {
    if (!course.evaluations || course.evaluations.length === 0) return;
    
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = `${course.id}: ${course.name}`;
    courseSelector.appendChild(option);
  });
  
  // Set up course change handler
  courseSelector.addEventListener('change', function() {
    const courseId = this.value;
    if (!courseId) {
      resetSection(role);
      return;
    }
    
    // Find selected course
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      console.error(`Course ${courseId} not found`);
      resetSection(role);
      return;
    }
    
    // Update state
    state[role].selectedCourse = course;
    state[role].selectedYear = null;
    
    // Update year filters
    updateYearFilters(role);
  });
  
  // Reset section initially
  resetSection(role);
}

function resetSection(role) {
  console.log(`Resetting ${role} section`);
  
  // Reset state
  state[role].selectedYear = null;
  
  // Clear year filters
  const yearFilters = document.getElementById(`${role}-year-filters`);
  if (yearFilters) {
    yearFilters.innerHTML = '';
  }
  
  // Reset chart
  const chartContainer = document.getElementById(`${role}-chart-container`);
  if (chartContainer) {
    chartContainer.innerHTML = '<div class="alert alert-info text-center">Select a course to view evaluation data.</div>';
  }
  
  // Reset comments
  const carouselInner = document.querySelector(`#${role}-comments-carousel .carousel-inner`);
  const indicators = document.querySelector(`#${role}-comments-carousel .carousel-indicators`);
  if (carouselInner) {
    carouselInner.innerHTML = '<div class="carousel-item active"><div class="p-4 text-center">Select a course to view student comments.</div></div>';
  }
  if (indicators) {
    indicators.innerHTML = '';
  }
  
  // Destroy existing chart
  if (chartInstances[role]) {
    try {
      chartInstances[role].destroy();
    } catch (e) {
      console.error("Error destroying chart:", e);
    }
    delete chartInstances[role];
  }
}

function updateYearFilters(role) {
  const course = state[role].selectedCourse;
  if (!course) {
    console.error(`No course selected for ${role}`);
    return;
  }
  
  console.log(`Updating year filters for ${role} with course ${course.id}`);
  
  const yearFilters = document.getElementById(`${role}-year-filters`);
  if (!yearFilters) {
    console.error(`Year filters #${role}-year-filters not found`);
    return;
  }
  
  // Clear existing filters
  yearFilters.innerHTML = '';
  yearFilters.style.display = 'flex';
  yearFilters.style.flexWrap = 'wrap'; 
  yearFilters.style.alignItems = 'flex-end';
  yearFilters.style.justifyContent = 'flex-start';
  yearFilters.style.width = 'auto'; // Don't take full width

  
  
  
  // Get unique years first (without terms)
  const uniqueYears = [...new Set(course.evaluations.map(e => e.year))];
  
  // Sort years in descending order
  uniqueYears.sort((a, b) => b - a);
  
  // Group evaluations by year
  const evaluationsByYear = {};
  uniqueYears.forEach(year => {
    evaluationsByYear[year] = course.evaluations.filter(e => e.year === year);
  });
  
  // Create a filter group for each year
  uniqueYears.forEach(year => {
    // Create a year header if there are multiple terms
    if (evaluationsByYear[year].length > 1) {
      // Create a card to visually group all buttons for this year
      const yearGroup = document.createElement('div');
      yearGroup.className = 'card d-inline-block me-2';
      yearGroup.style.verticalAlign = 'bottom';
      yearGroup.style.margin = '0'; 
      yearGroup.style.borderLeft = '4px solid #6c757d';
      yearGroup.style.position = 'relative';
      yearGroup.style.top = '6px'

      
      
      // Create card header with year info
      const yearHeader = document.createElement('div');
      yearHeader.className = 'card-header bg-light py-1';
      yearHeader.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${year} Academic Year</h6>
          <span class="badge badge-secondary">${evaluationsByYear[year].length} terms</span>
        </div>
      `;
      yearGroup.appendChild(yearHeader);
      
      // Create card body to contain all buttons for this year
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body p-1';
      yearGroup.appendChild(cardBody);
      
      // Add the entire card to the filters
      yearFilters.appendChild(yearGroup);
      
      // Add "All Terms" button inside the card body
      const allTermsBtn = document.createElement('button');
      allTermsBtn.type = 'button';
      allTermsBtn.className = 'btn btn-sm btn-outline-primary m-1';
      allTermsBtn.style.height='38px';
      allTermsBtn.style.alignItems ='center';
      allTermsBtn.style.justifyContent = 'center';
      allTermsBtn.style.display = 'inline-flex';
      allTermsBtn.textContent = `${year} (All Terms)`;
      allTermsBtn.dataset.year = year;
      allTermsBtn.dataset.allTerms = 'true';
      
      allTermsBtn.addEventListener('click', function() {
        // Update state to show all terms for this year
        state[role].selectedYear = parseInt(this.dataset.year);
        state[role].selectedTerm = 'all';
        
        // Update active state of buttons
        yearFilters.querySelectorAll('button').forEach(btn => {
          btn.className = btn === this ? 'btn btn-sm btn-primary m-1' : 'btn btn-sm btn-outline-secondary m-1';
          if (btn !== this && btn.dataset.allTerms === 'true') {
            btn.className = 'btn btn-sm btn-outline-primary m-1';
          }
        });
        
        // Update visualizations with all terms for this year
        updateVisualizationsMultiTerm(role);
      });
      
      cardBody.appendChild(allTermsBtn);
      
      // Create buttons for each term in this year inside the card body
      const termsForYear = evaluationsByYear[year];
      termsForYear.sort((a, b) => (a.term || '').localeCompare(b.term || ''));
      
      termsForYear.forEach(evaluation => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-sm btn-outline-secondary m-1';
        btn.style.height='38px';
        btn.style.alignItems ='center';
        btn.style.justifyContent = 'center';
        btn.style.display = 'inline-flex';
        btn.style.width = 'auto'; // Let content determine width
        btn.style.minWidth = 'fit-content';
        btn.style.flexGrow = '0'; // Prevent stretching, except it doesn't work and I'm stuck
        btn.textContent = evaluation.term ? `${evaluation.term}` : `${year}`;
        btn.dataset.year = year;
        btn.dataset.term = evaluation.term || '';
        
        btn.addEventListener('click', function() {
          // Update state with both year and term
          state[role].selectedYear = parseInt(this.dataset.year);
          state[role].selectedTerm = this.dataset.term;
          
          // Update active state of buttons
          yearFilters.querySelectorAll('button').forEach(btn => {
            btn.className = btn === this ? 'btn btn-sm btn-primary m-1' : 'btn btn-sm btn-outline-secondary m-1';
            if (btn !== this && btn.dataset.allTerms === 'true') {
              btn.className = 'btn btn-sm btn-outline-primary m-1';
            }
          });
          
          // Update visualizations for single term
          updateVisualizationsSingleTerm(role);
        });
        
        cardBody.appendChild(btn);
      });
    } else {
      // For years with only one term, create a simple button
      const evaluation = evaluationsByYear[year][0];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-secondary m-1';
      btn.style.height='38px';
      btn.style.alignItems ='center';
      btn.style.justifyContent = 'center';
      btn.style.display = 'inline-flex';
      btn.textContent = evaluation.term ? `${year} ${evaluation.term}` : `${year}`;
      btn.dataset.year = year;
      btn.dataset.term = evaluation.term || '';
      
      btn.addEventListener('click', function() {
        // Update state with both year and term
        state[role].selectedYear = parseInt(this.dataset.year);
        state[role].selectedTerm = this.dataset.term;
        
        // Update active state of buttons
        yearFilters.querySelectorAll('button').forEach(btn => {
          btn.className = btn === this ? 'btn btn-sm btn-primary m-1' : 'btn btn-sm btn-outline-secondary m-1';
        });
        
        // Update visualizations for single term
        updateVisualizationsSingleTerm(role);
      });
      
      yearFilters.appendChild(btn);
    }
  });
  
  // Select first year-term by default
  if (yearFilters.querySelector('button')) {
    yearFilters.querySelector('button').click();
  }
}

// Update visualization for a single term
function updateVisualizationsSingleTerm(role) {
  const course = state[role].selectedCourse;
  const year = state[role].selectedYear;
  const term = state[role].selectedTerm;
  
  if (!course || !year) {
    console.error(`Missing course or year for ${role}`, { course, year });
    return;
  }
  
  console.log(`Updating visualizations for ${role}, course ${course.id}, year ${year}, term ${term}`);
  
  // Find evaluation for the selected year and term
  const evaluation = course.evaluations.find(e => e.year === year && (e.term || '') === term);
  
  if (!evaluation) {
    console.error(`No evaluation found for ${course.id}, year ${year}, term ${term}`);
    return;
  }

  if (!evaluation.n && evaluation.metrics) {
    // Find the first metric with an n value, or calculate from counts
    const firstMetric = Object.values(evaluation.metrics)[0];
    if (firstMetric) {
      if (firstMetric.n) {
        evaluation.n = firstMetric.n;
      } else {
        // Calculate n from the sum of SD, D, N, A, SA
        evaluation.n = (firstMetric.SD || 0) + 
                       (firstMetric.D || 0) + 
                       (firstMetric.N || 0) + 
                       (firstMetric.A || 0) + 
                       (firstMetric.SA || 0);
      }
    }
  }  
  
  // Update chart and comments
  renderChart(role, course, evaluation);
  renderComments(role, course, evaluation);
  renderWordCloud(role, course, evaluation);
}

// Update visualization for all terms in a year
function updateVisualizationsMultiTerm(role) {
  const course = state[role].selectedCourse;
  const year = state[role].selectedYear;
  
  if (!course || !year) {
    console.error(`Missing course or year for ${role}`, { course, year });
    return;
  }
  
  console.log(`Updating visualizations for ${role}, course ${course.id}, all terms in year ${year}`);
  
  // Find all evaluations for the selected year
  const evaluations = course.evaluations.filter(e => e.year === year); 
  
  if (!evaluations || evaluations.length === 0) {
    console.error(`No evaluations found for ${course.id}, year ${year}`);
    return;
  }
  
  // Merge evaluations data
  const mergedEvaluation = {
    year: year,
    term: 'All Terms',
    metrics: {},
    comments: []
  };
  
  // Merge metrics
  evaluations.forEach(evaluation => {
    if (evaluation.metrics) {
      Object.entries(evaluation.metrics).forEach(([key, metric]) => {
        if (!mergedEvaluation.metrics[key]) {
          mergedEvaluation.metrics[key] = {
            question: metric.question,
            SD: 0, D: 0, N: 0, A: 0, SA: 0,
            n: 0
          };
        }
        
        // Sum up the counts
        mergedEvaluation.metrics[key].SD += metric.SD || 0;
        mergedEvaluation.metrics[key].D += metric.D || 0;
        mergedEvaluation.metrics[key].N += metric.N || 0;
        mergedEvaluation.metrics[key].A += metric.A || 0;
        mergedEvaluation.metrics[key].SA += metric.SA || 0;
        mergedEvaluation.metrics[key].n += metric.n || 0;
      });
    }
    
    // Merge comments
    if (evaluation.comments && Array.isArray(evaluation.comments)) {
      evaluation.comments.forEach(comment => {
        if (comment && comment.trim()) {
          mergedEvaluation.comments.push(`[${evaluation.term || ''}] ${comment}`);
        }
      });
    }
  });
  
  // Calculate total responses from any metric
  mergedEvaluation.n = evaluations.reduce((total, evaluation) => {
  // If evaluation has a direct n property, use that
  if (evaluation.n) {
    return total + evaluation.n;
  }
  
  // Otherwise, try to get n from the first metric
  if (evaluation.metrics && Object.keys(evaluation.metrics).length > 0) 
  {
    const firstMetric = Object.values(evaluation.metrics)[0];
    if (firstMetric.n) {
      return total + firstMetric.n;
    }
    
    // If no n in metric, sum up the values
    const metricSum = (firstMetric.SD || 0) + 
                     (firstMetric.D || 0) + 
                     (firstMetric.N || 0) + 
                     (firstMetric.A || 0) + 
                     (firstMetric.SA || 0);
    return total + metricSum;
  }
  
  return total;
}, 0);
  
  // Update chart and comments with merged data
  renderChart(role, course, mergedEvaluation);
  renderComments(role, course, mergedEvaluation);
  renderWordCloud(role, course, mergedEvaluation);
}

function updateVisualizations(role) {
  const term = state[role].selectedTerm;
  
  if (term === 'all') {
    updateVisualizationsMultiTerm(role);
  } else {
    updateVisualizationsSingleTerm(role);
  }
}

function renderChart(role, course, evaluation) {
  const chartContainer = document.getElementById(`${role}-chart-container`);
  if (!chartContainer) return;
  
  // Clear container
  chartContainer.innerHTML = '';
  
  // Destroy existing chart
  if (chartInstances[role]) {
    try {
      chartInstances[role].destroy();
    } catch (e) { /* ignore */ }
    delete chartInstances[role];
  }
  
  // Create header
  const header = document.createElement('div');
  header.className = 'text-center mb-3';
  header.innerHTML = `
    <h5>${course.id}: ${course.name}</h5>
    <p class="text-muted">${evaluation.term || ''} ${evaluation.year} - Responses: ${evaluation.n || 'N/A'}</p>
  `;
  chartContainer.appendChild(header);
  
  // Check if metrics exist
  if (!evaluation.metrics || Object.keys(evaluation.metrics).length === 0) {
    chartContainer.innerHTML += '<div class="alert alert-info">No metrics data available for this evaluation.</div>';
    return;
  }
  
  // Create a wrapper div with constrained height
  const chartWrapper = document.createElement('div');
  chartWrapper.style.height = '400px'; // Fixed height to prevent infinite growth
  chartWrapper.style.maxHeight = '70vh'; // Responsive but limited
  chartWrapper.style.overflow = 'auto'; // Allow scrolling if content exceeds height
  chartContainer.appendChild(chartWrapper);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = `${role}-chart-canvas`;
  chartWrapper.appendChild(canvas);
  
  // Process metrics
  const metrics = Object.entries(evaluation.metrics).map(([key, data]) => ({
    key,
    question: data.question || key,
    SD: data.SD || 0,
    D: data.D || 0,
    N: data.N || 0,
    A: data.A || 0,
    SA: data.SA || 0
  }));
  
  // Sort metrics alphabetically by question
  metrics.sort((a, b) => a.question.localeCompare(b.question));
  
  // Extract questions and counts
  const questions = metrics.map(m => m.question);
  const sdData = metrics.map(m => m.SD);
  const dData = metrics.map(m => m.D);
  const nData = metrics.map(m => m.N);
  const aData = metrics.map(m => m.A);
  const saData = metrics.map(m => m.SA);
  
  // Calculate dynamic chart height based on number of questions
  // This ensures each question has adequate space
  const minHeightPerQuestion = 40; // pixels per question
  let chartHeight = Math.max(300, questions.length * minHeightPerQuestion);
  canvas.style.height = `${chartHeight}px`;
  
  // Create chart
  chartInstances[role] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: questions,
      datasets: [
        {
          label: 'Strongly Agree',
          data: saData,
          backgroundColor: 'rgba(40, 167, 69, 0.8)'
        },
        {
          label: 'Agree',
          data: aData,
          backgroundColor: 'rgba(92, 184, 92, 0.8)'
        },
        {
          label: 'Neutral',
          data: nData,
          backgroundColor: 'rgba(255, 193, 7, 0.8)'
        },
        {
          label: 'Disagree',
          data: dData,
          backgroundColor: 'rgba(220, 53, 69, 0.7)'
        },
        {
          label: 'Strongly Disagree',
          data: sdData,
          backgroundColor: 'rgba(204, 0, 0, 0.8)'
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false, // Allow custom height
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.raw || 0;
              const total = evaluation.n || 0;
              const percentage = total > 0 ? (value / total * 100).toFixed(1) : 'N/A';
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        },
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        x: {
          stacked: false,
          title: {
            display: true,
            text: 'Number of Responses'
          },
          ticks: {
            precision: 0
          }
        },
        y: {
          stacked: false,
          ticks: {
            callback: function(value) {
              const label = this.getLabelForValue(value);
              return label.length > 50 ? label.substr(0, 47) + '...' : label;
            }
          }
        }
      }
    }
  });
}

function renderComments(role, course, evaluation) {
  const carouselInner = document.querySelector(`#${role}-comments-carousel .carousel-inner`);
  const indicators = document.querySelector(`#${role}-comments-carousel .carousel-indicators`);
  
  if (!carouselInner || !indicators) return;
  
  // Clear existing content
  carouselInner.innerHTML = '';
  indicators.innerHTML = '';
  
  // Check if comments exist
  if (!evaluation.comments || !Array.isArray(evaluation.comments) || evaluation.comments.length === 0) {
    carouselInner.innerHTML = '<div class="carousel-item active"><div class="p-4 text-center">No comments available for this course.</div></div>';
    return;
  }
  
  // Create carousel items
  evaluation.comments.forEach((comment, index) => {
    if (!comment) return;
    
    // Create carousel item
    const item = document.createElement('div');
    item.className = `carousel-item${index === 0 ? ' active' : ''}`;
    
    // Add content
    const escapedComment = comment
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    item.innerHTML = `
      <div class="p-4">
        <blockquote class="blockquote">
          <p class="mb-0">"${escapedComment}"</p>
          <footer class="blockquote-footer text-right">
            ${course.id} (${evaluation.term || ''} ${evaluation.year})
          </footer>
        </blockquote>
      </div>
    `;
    
    carouselInner.appendChild(item);
    
    // Create indicator
    const indicator = document.createElement('li');
    indicator.dataset.target = `#${role}-comments-carousel`;
    indicator.dataset.slideTo = index;
    if (index === 0) indicator.className = 'active';
    indicators.appendChild(indicator);
  });
  
  // Initialize carousel
  try {
    if (typeof $ !== 'undefined') {
      $(`#${role}-comments-carousel`).carousel();
    }
  } catch (e) {
    console.warn('Could not initialize carousel', e);
  }
}

// Update the renderWordCloud function to fix the ID mismatch and improve error handling

function renderWordCloud(role, course, evaluation) {
  // Fix ID mismatch - your HTML uses 'comment-word-cloud' without any 's'
  const wordCloudContainer = document.getElementById(`${role}-comment-word-cloud`);
  if (!wordCloudContainer) {
    console.error(`Word cloud container #${role}-comment-word-cloud not found`);
    return;
  }
  
  // Clear existing content
  wordCloudContainer.innerHTML = '';
  
  // Check if comments exist
  if (!evaluation.comments || !Array.isArray(evaluation.comments) || evaluation.comments.length === 0) {
    wordCloudContainer.innerHTML = '<div class="alert alert-info text-center">No comments available for word cloud generation.</div>';
    return;
  }
  
  // Show loading indicator
  wordCloudContainer.innerHTML = '<div class="text-center" id="word-cloud-loading"><div class="spinner-border text-primary"></div><p class="mt-2">Generating word cloud...</p></div>';

  try {
    // Check for d3 and cloud layout
    if (typeof d3 === 'undefined') {
      throw new Error('D3.js library not available');
    }

    if (typeof d3.layout === 'undefined' || typeof d3.layout.cloud === 'undefined') {
      throw new Error('D3 cloud layout not available');
    }

    // Combine all comments into one text
    const text = evaluation.comments.join(' ');
    
    // Process text to get word counts
    const words = processText(text);
    
    // Check if we have enough words
    if (words.length < 3) {
      wordCloudContainer.innerHTML = '<div class="alert alert-info text-center">Not enough unique words for a meaningful word cloud.</div>';
      return;
    }
    
    console.log(`Generating word cloud with ${words.length} words`);
    
    // Create SVG container
    const width = wordCloudContainer.clientWidth || 400; // Fallback width if clientWidth is 0
    const height = 300; // Fixed height as defined in your HTML
    
    // Remove loading indicator before adding SVG
    const loadingIndicator = document.getElementById('word-cloud-loading');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
    
    const svg = d3.select(wordCloudContainer)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
    
    // Define the draw function before starting the cloud layout
    function draw(words) {
      svg.selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Arial, sans-serif")
        .style("fill", () => {
          // Generate a random color from a professional palette
          const colors = [
            "#4285F4", // Google Blue
            "#34A853", // Google Green
            "#FBBC05", // Google Yellow
            "#EA4335", // Google Red
            "#5F6368", // Google Grey
            "#1A73E8", // Lighter Blue
            "#174EA6"  // Darker Blue
          ];
          return colors[Math.floor(Math.random() * colors.length)];
        })
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text);
    }
    
    // Set a timeout to prevent UI freezing and ensure async operation
    setTimeout(() => {
      try {
        // Generate cloud layout
        d3.layout.cloud()
          .size([width, height])
          .words(words.map(d => ({ text: d.text, size: d.size })))
          .padding(5)
          .rotate(() => ~~(Math.random() * 2) * 90) // Only horizontal and vertical
          .fontSize(d => d.size)
          .on("end", draw)
          .start();
      } catch (err) {
        console.error("Error in word cloud generation:", err);
        wordCloudContainer.innerHTML = `<div class="alert alert-danger text-center">Error generating word cloud: ${err.message}</div>`;
      }
    }, 100);
    
  } catch (error) {
    console.error("Error generating word cloud:", error);
    wordCloudContainer.innerHTML = `<div class="alert alert-danger text-center">Error generating word cloud: ${error.message}</div>`;
  }
}

// Helper function to process text for word cloud
function processText(text) {
  // Convert to lowercase and remove punctuation
  const words = text.toLowerCase()
    .replace(/[^\w\s]|_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  
  // Remove common stop words
  const stopWords = new Set([
    "gabriel","alba","dall","gabe", "dall'alba", "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", 
    "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", 
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", 
    "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", 
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", 
    "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", 
    "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", 
    "she's", "should", "shouldn't", "every", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", 
    "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", 
    "those", "through", "boring", "to", "dull", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", 
    "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", 
    "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", 
    "you've", "your", "yours", "yourself", "yourselves",
    // Add domain-specific stop words
    "course", "class", "professor", "instructor", "lecture", "teacher", "student", "ta", "teaching", "assistant", "semester"
  ]);
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    if (word.length > 2 && !stopWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Convert to array and sort by frequency
  const wordArray = Object.entries(wordCount)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count);
  
  // Take top 50 words max
  const topWords = wordArray.slice(0, 50);
  
  // Scale font sizes between 12 and 50 based on frequency
  const minCount = Math.min(...topWords.map(w => w.count));
  const maxCount = Math.max(...topWords.map(w => w.count));
  const minSize = 14;
  const maxSize = 50;
  
  return topWords.map(word => ({
    text: word.text,
    size: maxCount > minCount 
      ? minSize + (word.count - minCount) / (maxCount - minCount) * (maxSize - minSize)
      : 25  // If all words have same count, use medium size
  }));
}

function updateVisualizations(role) {
  const course = state[role].selectedCourse;
  const year = state[role].selectedYear;
  
  if (!course || !year) {
    console.error(`Missing course or year for ${role}`, { course, year });
    return;
  }
  
  console.log(`Updating visualizations for ${role}, course ${course.id}, year ${year}`);
  
  // Find evaluation for the selected year
  const evaluation = course.evaluations.find(e => e.year === year);
  
  if (!evaluation) {
    console.error(`No evaluation found for ${course.id}, year ${year}`);
    return;
  }
  
  // Update chart and comments
  renderChart(role, course, evaluation);
  renderComments(role, course, evaluation);
  renderWordCloud(role, course, evaluation);
}

// Also update resetSection to reset the word cloud
function resetSection(role) {
  console.log(`Resetting ${role} section`);
  
  // Reset state
  state[role].selectedYear = null;
  
  // Clear year filters
  const yearFilters = document.getElementById(`${role}-year-filters`);
  if (yearFilters) {
    yearFilters.innerHTML = '';
  }
  
  // Reset chart
  const chartContainer = document.getElementById(`${role}-chart-container`);
  if (chartContainer) {
    chartContainer.innerHTML = '<div class="alert alert-info text-center">Select a course to view evaluation data.</div>';
  }
  
  // Reset comments
  const carouselInner = document.querySelector(`#${role}-comments-carousel .carousel-inner`);
  const indicators = document.querySelector(`#${role}-comments-carousel .carousel-indicators`);
  if (carouselInner) {
    carouselInner.innerHTML = '<div class="carousel-item active"><div class="p-4 text-center">Select a course to view student comments.</div></div>';
  }
  if (indicators) {
    indicators.innerHTML = '';
  }
  
  // Reset word cloud
  const wordCloudContainer = document.getElementById(`${role}-comment-word-cloud`);
  if (wordCloudContainer) {
    wordCloudContainer.innerHTML = '<div class="alert alert-info text-center">Select a course to generate word cloud.</div>';
  }
  
  // Destroy existing chart
  if (chartInstances[role]) {
    try {
      chartInstances[role].destroy();
    } catch (e) {
      console.error("Error destroying chart:", e);
    }
    delete chartInstances[role];
  }
}
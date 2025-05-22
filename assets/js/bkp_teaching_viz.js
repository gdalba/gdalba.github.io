

const wordCloudCache = {};
const commentCarouselCache = {};
const metricsCache = new Map();
const boxPlotCache = new Map();
const filteredDataCache = new Map();


// Attempt to add debouncing
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', function() {
  // Load evaluation data
  fetch('/assets/data/teaching_evaluations.json')
    .then(response => response.json())
    .then(data => {
      // Split the data by role
      const lecturerData = {
        courses: data.courses.filter(course => course.role.toLowerCase().includes('lecturer'))
      };

      const taData = {
        courses: data.courses.filter(course => 
          course.role.toLowerCase().includes('teaching assistant') ||
          course.role.toLowerCase().includes('ta')
        )
      };

      // Initialize visualizations for lecturers
      if (lecturerData.courses.length > 0) {
        initializeFilters(lecturerData, 'lecturer');
        renderCharts(lecturerData, 'lecturer');
      } else {
        document.getElementById('lecturer').innerHTML = '<div class="alert alert-info">No lecturer data available yet.</div>';
      }

      // Initialize visualizations for TAs
      if (taData.courses.length > 0) {
        initializeFilters(taData, 'ta');
        renderCharts(taData, 'ta');
      } else {
        document.getElementById('ta').innerHTML = '<div class="alert alert-info">No teaching assistant data available yet.</div>';
      }
    })
    .catch(error => {
      console.error('Error loading evaluation data:', error);
      document.getElementById('lecturer').innerHTML = '<div class="alert alert-danger">Error loading evaluation data.</div>';
      document.getElementById('ta').innerHTML = '<div class="alert alert-danger">Error loading evaluation data.</div>';
    });
});

function initializeFilters(data, role) {
  
  // Extract unique years and course IDs
  const years = new Set();
  const courses = [];
  
  data.courses.forEach(course => {
  // Add course to the list
  courses.push({
    id: course.id,
    name: course.name
  });
  
  // Add years to the set
  course.evaluations.forEach(eval => {
    years.add(eval.year);
  });
  });
  
  const sortedYears = Array.from(years).sort().reverse();
  const sortedCourses = courses.sort((a, b) => a.name.localeCompare(b.name));
  
  // Render year filters
  const yearFiltersDiv = document.getElementById(`${role}-year-filters`);
  sortedYears.forEach((year, index) => {
  const btn = document.createElement('button');
  btn.className = `btn btn-sm ${index === 0 ? 'btn-primary' : 'btn-outline-secondary'} ${role}-year-filter m-1`;
  btn.innerText = year;
  btn.dataset.year = year;
  btn.onclick = debounce(function() {
    document.querySelectorAll(`.${role}-year-filter`).forEach(b => {
    b.classList.remove('active', 'btn-primary');
    b.classList.add('btn-outline-secondary');
    });
    this.classList.add('active', 'btn-primary');
    this.classList.remove('btn-outline-secondary');
    window.updateCharts(role);
  }, 250);
  
  // Set first year as active
  if (index === 0) {
    btn.classList.add('active');
  }
  
  yearFiltersDiv.appendChild(btn);
  });
  
  // Render course filters
  const courseFiltersDiv = document.getElementById(`${role}-course-filters`);
  sortedCourses.forEach((course, index) => {
  const btn = document.createElement('button');
  btn.className = `btn btn-sm ${index === 0 ? 'btn-primary' : 'btn-outline-secondary'} ${role}-course-filter m-1`;
  btn.innerText = course.id;
  btn.dataset.courseId = course.id;
  btn.onclick = debounce(function() {
    document.querySelectorAll(`.${role}-course-filter`).forEach(b => {
    b.classList.remove('active', 'btn-primary');
    b.classList.add('btn-outline-secondary');
    });
    this.classList.add('active', 'btn-primary');
    this.classList.remove('btn-outline-secondary');
    window.updateCharts(role);
  }, 250);
  
  // Set first course as active
  if (index === 0) {
    btn.classList.add('active');
  }
  
  courseFiltersDiv.appendChild(btn);
  });
}

// Global object to store chart instances
const charts = {
  lecturer: {
    barChart: null,
    boxPlot: null,
    wordCloud: null
  },
  ta: {
    barChart: null,
    boxPlot: null,
    wordCloud: null
  }
};

function renderCharts(data, role) {
  // Initial chart rendering
  renderBarChart(data, role);
  renderBoxPlot(data, role);
  renderWordCloud(data, role);
  renderCommentCarousel(data, role);
  
  // Set up update function
  if (!window.updateChartsForRole) {
    window.updateChartsForRole = {};
  }
  
window.updateChartsForRole[role] = async function() {
  // Get selected filters
  const selectedYears = Array.from(document.querySelectorAll(`.${role}-year-filter.active`))
    .map(btn => parseInt(btn.dataset.year));
  
  const selectedCourses = Array.from(document.querySelectorAll(`.${role}-course-filter.active`))
    .map(btn => btn.dataset.courseId);
  
  // Create cache key for this filter combination
  const filterKey = JSON.stringify({years: selectedYears, courses: selectedCourses, role});
  
  // Show loading indicator only for word cloud (most intensive operation)
  document.getElementById(`${role}-comment-word-cloud`).innerHTML = 
    '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>';
  
  // Get or create filtered data
  let filteredData;
  if (filteredDataCache.has(filterKey)) {
    filteredData = filteredDataCache.get(filterKey);
  } else {
    filteredData = filterData(data, selectedYears, selectedCourses);
    filteredDataCache.set(filterKey, filteredData);
  }
  
  // Update charts one at a time with short delay between
  // This prevents browser UI freezing by allowing rendering between operations
  updateBarChart(filteredData, role);
  await new Promise(resolve => setTimeout(resolve, 10));
  
  updateBoxPlot(filteredData, role);
  await new Promise(resolve => setTimeout(resolve, 10));
  
  // Word cloud is the most intensive, so update it last
  updateWordCloud(filteredData, role);
  await new Promise(resolve => setTimeout(resolve, 10));
  
  updateCommentCarousel(filteredData, role);
};
  
  // Global update function that can be called from HTML
  window.updateCharts = function(role) {
    if (window.updateChartsForRole && window.updateChartsForRole[role]) {
      window.updateChartsForRole[role]();
    }
  };
}

function filterData(data, years, courseIds) {
  // Filter courses by ID
  const filteredCourses = data.courses.filter(course => courseIds.includes(course.id));
  
  // For each course, filter evaluations by year
  const result = {
    courses: filteredCourses.map(course => {
      const filteredEvals = course.evaluations.filter(eval => years.includes(eval.year));
      return {
        ...course,
        evaluations: filteredEvals
      };
    })
  };
  
  return result;
}

function getAverageMetrics(data) {
  // Cache key based on data content
  const cacheKey = JSON.stringify(data.courses.map(c => c.id));

  // Fix the cache check - was using wrong syntax
  if (metricsCache.has(cacheKey)) {
    return metricsCache.get(cacheKey);
  }

  if (!data || !data.courses || data.courses.length === 0) {
    return {};
  }
  
  const allMetrics = {};
  let totalEvaluations = 0;
  
  // Collect all metrics across all evaluations
  data.courses.forEach(course => {
    course.evaluations.forEach(eval => {
      totalEvaluations++;
      Object.entries(eval.metrics).forEach(([key, value]) => {
        if (!allMetrics[key]) {
          allMetrics[key] = [];
        }
        allMetrics[key].push(value);
      });
    });
  });
  
  // Calculate averages
  const averageMetrics = {};
  Object.entries(allMetrics).forEach(([key, values]) => {
    averageMetrics[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
  });
  
  metricsCache.set(cacheKey, averageMetrics); // Store in cache
  return averageMetrics;
}

function renderBarChart(data, role) {
  const ctx = document.getElementById(`${role}-overall-ratings-chart`).getContext('2d');
  
  const averageMetrics = getAverageMetrics(data);
  
  // Format the labels
  const formattedLabels = Object.keys(averageMetrics).map(key => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  });
  
  // Clean up any existing chart
  if (charts[role].barChart) {
    charts[role].barChart.destroy();
  }
  
  charts[role].barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: formattedLabels,
      datasets: [{
        label: 'Average Rating',
        data: Object.values(averageMetrics),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Rating: ${context.parsed.y.toFixed(2)}/5.00`;
            }
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });
}

function updateBarChart(filteredData, role) {
  const averageMetrics = getAverageMetrics(filteredData);
  
  if (charts[role].barChart) {
    charts[role].barChart.data.labels = Object.keys(averageMetrics).map(key => {
      return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    });
    charts[role].barChart.data.datasets[0].data = Object.values(averageMetrics);
    charts[role].barChart.update();
  }
}

function getAllMetricsData(data) {
  const metricsData = {};
  
  // Collect all metrics values for box plot
  data.courses.forEach(course => {
    course.evaluations.forEach(eval => {
      Object.entries(eval.metrics).forEach(([key, value]) => {
        if (!metricsData[key]) {
          metricsData[key] = [];
        }
        metricsData[key].push(value);
      });
    });
  });
  
  return metricsData;
}

function renderBoxPlot(data, role) {
  const ctx = document.getElementById(`${role}-metrics-radar-chart`).getContext('2d');
  
  // Get all metrics data for box plots
  const metricsData = getAllMetricsData(data);
  
  // Format labels
  const labels = Object.keys(metricsData).map(key => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  });
  
  // Calculate box plot statistics for each metric
  const boxplotStats = Object.values(metricsData).map(values => {
    const sortedValues = [...values].sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const median = sortedValues[Math.floor(sortedValues.length * 0.5)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    
    return {
      min,
      q1,
      median,
      q3,
      max
    };
  });
  
  // Clean up any existing chart
  if (charts[role].boxPlot) {
    charts[role].boxPlot.destroy();
  }
  
  // Create datasets for median, quartiles, and min/max
  charts[role].boxPlot = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          // Min to Max bars
          label: 'Range',
          data: boxplotStats.map(stats => stats.max - stats.min),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 0,
          barPercentage: 0.3,
          base: boxplotStats.map(stats => stats.min)
        },
        {
          // Q1 to Q3 boxes
          label: 'Interquartile Range',
          data: boxplotStats.map(stats => stats.q3 - stats.q1),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          barPercentage: 0.5,
          base: boxplotStats.map(stats => stats.q1)
        },
        {
          // Median lines
          label: 'Median',
          data: boxplotStats.map(stats => 0.01), // Small value for visual representation
          backgroundColor: 'rgba(255, 99, 132, 1)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          barPercentage: 0.8,
          base: boxplotStats.map(stats => stats.median)
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        }
      },
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const datasetIndex = context.datasetIndex;
              const index = context.dataIndex;
              const stats = boxplotStats[index];
              
              if (datasetIndex === 0) {
                return [
                  `Min: ${stats.min.toFixed(2)}`,
                  `Max: ${stats.max.toFixed(2)}`
                ];
              } else if (datasetIndex === 1) {
                return [
                  `Q1: ${stats.q1.toFixed(2)}`,
                  `Q3: ${stats.q3.toFixed(2)}`
                ];
              } else {
                return `Median: ${stats.median.toFixed(2)}`;
              }
            }
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });
}

function updateBoxPlot(filteredData, role) {
  // Create cache key based on the filtered data
  const cacheKey = JSON.stringify(
    filteredData.courses.map(c => 
      c.id + "-" + c.evaluations.length
    )
  );
  
  // Use cached calculations if available
  let metricsData, boxplotStats;
  
  if (boxPlotCache.has(cacheKey)) {
    const cached = boxPlotCache.get(cacheKey);
    metricsData = cached.metricsData;
    boxplotStats = cached.boxplotStats;
  } else {
    // Calculate metrics data
    metricsData = getAllMetricsData(filteredData);
    
    // Calculate box plot statistics
    boxplotStats = Object.values(metricsData).map(values => {
      const sortedValues = [...values].sort((a, b) => a - b);
      if (sortedValues.length === 0) return {min: 0, q1: 0, median: 0, q3: 0, max: 0};
      
      const min = sortedValues[0];
      const max = sortedValues[sortedValues.length - 1];
      const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)] || min;
      const median = sortedValues[Math.floor(sortedValues.length * 0.5)] || min;
      const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)] || max;
      
      return { min, q1, median, q3, max };
    });
    
    // Cache the calculations
    boxPlotCache.set(cacheKey, { metricsData, boxplotStats });
  }
  
  // Format labels for display
  const labels = Object.keys(metricsData).map(key => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  });
  
  // Update chart with calculated values
  if (charts[role].boxPlot) {
    charts[role].boxPlot.data.labels = labels;
    charts[role].boxPlot.data.datasets[0].data = boxplotStats.map(stats => stats.max - stats.min);
    charts[role].boxPlot.data.datasets[0].base = boxplotStats.map(stats => stats.min);
    charts[role].boxPlot.data.datasets[1].data = boxplotStats.map(stats => stats.q3 - stats.q1);
    charts[role].boxPlot.data.datasets[1].base = boxplotStats.map(stats => stats.q1);
    charts[role].boxPlot.data.datasets[2].base = boxplotStats.map(stats => stats.median);
    charts[role].boxPlot.update('none'); // Use 'none' animation for performance
  }
}

function extractWordsFromComments(data) {
  const commonWords = new Set(['gabriel', 'dall', 'alba', 'gabe', 'the', 'and', 'that', 'was', 'for', 'this', 'with', 'very', 'have', 'from', 'are', 'his', 'were', 'they', 'had', 'but', 'has', 'not', 'what', 'all', 'their', 'when', 'who', 'will', 'more', 'each', 'also', 'than']);
  let allText = '';
  
  data.courses.forEach(course => {
    course.evaluations.forEach(eval => {
      eval.comments.forEach(comment => {
        allText += ' ' + comment.toLowerCase();
      });
    });
  });
  
  // Clean and tokenize the text
  const words = allText
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ')
    .split(' ')
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  // Count word frequencies
  const wordCounts = {};
  words.forEach(word => {
    if (wordCounts[word]) {
      wordCounts[word]++;
    } else {
      wordCounts[word] = 1;
    }
  });
  
  // Convert to array of objects for word cloud
  return Object.entries(wordCounts).map(([text, value]) => ({ text, value }));
}

function renderWordCloud(data, role, cacheKey) {
  const container = document.getElementById(`${role}-comment-word-cloud`);
  
  // Process in a separate non-blocking thread with requestAnimationFrame
  requestAnimationFrame(() => {
    // Extract and process words (expensive operation)
    const words = extractWordsFromComments(data);
    
    if (words.length === 0) {
      const html = '<div class="alert alert-info">No comments available for word cloud.</div>';
      container.innerHTML = html;
      wordCloudCache[role] = { key: cacheKey, html };
      return;
    }
    
    // Create a simple and efficient word cloud display (no D3)
    // This is much faster than D3 cloud layout
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.justifyContent = 'center';
    
    // Take only top 30 words
    words.sort((a, b) => b.value - a.value)
      .slice(0, 30)
      .forEach(word => {
        const span = document.createElement('span');
        span.innerText = word.text;
        span.style.fontSize = `${10 + word.value * 1.5}px`;
        span.style.margin = '5px';
        span.style.color = `hsl(210, 70%, 50%)`;
        span.style.display = 'inline-block';
        wrapper.appendChild(span);
      });
    
    container.appendChild(wrapper);
    
    // Cache the generated HTML
    wordCloudCache[role] = { 
      key: cacheKey, 
      html: container.innerHTML 
    };
  });
}

function updateWordCloud(filteredData, role) {
  // Generate cache key based on the comments
  const commentsKey = JSON.stringify(
    filteredData.courses.map(c => 
      c.id + "-" + c.evaluations.length + "-" + 
      c.evaluations.reduce((sum, e) => sum + e.comments.length, 0)
    )
  );
  
  // Check if we already have this data cached
  if (wordCloudCache[role] && wordCloudCache[role].key === commentsKey) {
    // Just restore the cached DOM content if we have it
    if (wordCloudCache[role].html) {
      document.getElementById(`${role}-comment-word-cloud`).innerHTML = wordCloudCache[role].html;
      return;
    }
  }
  
  // Otherwise, generate the word cloud (expensive operation)
  renderWordCloud(filteredData, role, commentsKey);
}

function renderCommentCarousel(data, role) {
  // Get all comments from the data
  let allComments = [];
  
  data.courses.forEach(course => {
    course.evaluations.forEach(eval => {
      eval.comments.forEach(comment => {
        allComments.push({
          text: comment,
          course: course.name.split(' - ')[0],
          year: eval.year,
          term: eval.term
        });
      });
    });
  });
  
  // Shuffle the comments and limit to 15
  allComments = allComments
    .sort(() => 0.5 - Math.random())
    .slice(0, 15);
  
  // Get the carousel elements
  const carouselInner = document.querySelector(`#${role}-comment-carousel .carousel-inner`);
  const carouselIndicators = document.querySelector(`#${role}-comment-carousel .carousel-indicators`);
  
  // Clear existing content
  carouselInner.innerHTML = '';
  carouselIndicators.innerHTML = '';
  
  if (allComments.length === 0) {
    carouselInner.innerHTML = '<div class="carousel-item active"><p class="text-center">No comments available.</p></div>';
    return;
  }
  
  // Add comments to carousel
  allComments.forEach((comment, i) => {
    // Create indicator
    const indicator = document.createElement('li');
    indicator.setAttribute('data-target', `#${role}-comment-carousel`);
    indicator.setAttribute('data-slide-to', i);
    if (i === 0) indicator.classList.add('active');
    carouselIndicators.appendChild(indicator);
    
    // Create slide
    const item = document.createElement('div');
    item.className = `carousel-item ${i === 0 ? 'active' : ''}`;
    
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'blockquote mb-0';
    
    const p = document.createElement('p');
    p.innerHTML = `"${comment.text}"`;
    
    const footer = document.createElement('footer');
    footer.className = 'blockquote-footer text-right';
    footer.innerHTML = `Student, ${comment.course} (${comment.term} ${comment.year})`;
    
    blockquote.appendChild(p);
    blockquote.appendChild(footer);
    item.appendChild(blockquote);
    carouselInner.appendChild(item);
  });
}

function updateCommentCarousel(filteredData, role) {
  // Create a cache key based on available comments
  const commentsKey = JSON.stringify(
    filteredData.courses.map(c => 
      c.id + "-" + c.evaluations.reduce((sum, e) => sum + e.comments.length, 0)
    )
  );
  
  // Use cached version if available
  if (commentCarouselCache[role] && commentCarouselCache[role].key === commentsKey) {
    if (commentCarouselCache[role].innerHtml && commentCarouselCache[role].indicatorsHtml) {
      document.querySelector(`#${role}-comment-carousel .carousel-inner`).innerHTML = 
        commentCarouselCache[role].innerHtml;
      document.querySelector(`#${role}-comment-carousel .carousel-indicators`).innerHTML = 
        commentCarouselCache[role].indicatorsHtml;
      return;
    }
  }
  
  renderCommentCarousel(filteredData, role, commentsKey);
}
  
function renderCommentCarousel(data, role, cacheKey) {
  // Render in a non-blocking thread using requestAnimationFrame
  requestAnimationFrame(() => {
    // Get all comments and process
    let allComments = [];
    
    data.courses.forEach(course => {
      course.evaluations.forEach(eval => {
        eval.comments.forEach(comment => {
          allComments.push({
            text: comment,
            course: course.name.split(' - ')[0],
            year: eval.year,
            term: eval.term
          });
        });
      });
    });
    
    // Get carousel elements
    const carouselInner = document.querySelector(`#${role}-comment-carousel .carousel-inner`);
    const carouselIndicators = document.querySelector(`#${role}-comment-carousel .carousel-indicators`);
    
    // Set up variables to store HTML
    let innerHtml = '';
    let indicatorsHtml = '';
    
    if (allComments.length === 0) {
      innerHtml = '<div class="carousel-item active"><p class="text-center">No comments available.</p></div>';
      carouselInner.innerHTML = innerHtml;
      carouselIndicators.innerHTML = '';
      
      // Cache the empty result
      commentCarouselCache[role] = { 
        key: cacheKey, 
        innerHtml,
        indicatorsHtml: ''
      };
      return;
    }
    
    // Shuffle and limit comments (max 15)
    allComments = allComments
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);
      
    // Build HTML strings instead of DOM manipulation for better performance
    allComments.forEach((comment, i) => {
      // Build indicator HTML
      indicatorsHtml += `<li data-target="#${role}-comment-carousel" data-slide-to="${i}" 
                          ${i === 0 ? 'class="active"' : ''}></li>`;
      
      // Build carousel item HTML
      innerHtml += `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
          <blockquote class="blockquote mb-0">
            <p>"${comment.text}"</p>
            <footer class="blockquote-footer text-right">
              Student, ${comment.course} (${comment.term} ${comment.year})
            </footer>
          </blockquote>
        </div>
      `;
    });
    
    // Update the DOM once (much faster than multiple operations)
    carouselInner.innerHTML = innerHtml;
    carouselIndicators.innerHTML = indicatorsHtml;
    
    // Cache the generated HTML
    commentCarouselCache[role] = { 
      key: cacheKey, 
      innerHtml, 
      indicatorsHtml 
    };
  });
}
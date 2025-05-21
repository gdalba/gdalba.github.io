document.addEventListener('DOMContentLoaded', function() {
  // Load evaluation data
  fetch('/assets/data/teaching_evaluations.json')
    .then(response => response.json())
    .then(data => {
      // Split the data by role
      const lecturerData = {
        courses: data.courses.filter(course => course.role.toLowerCase().includes('lecturer') || course.role.toLowerCase().includes('instructor'))
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
    .catch(error => console.error('Error loading evaluation data:', error));
});

function renderCommentCarousel(data, role) {
  // Get all comments from the data
  const allComments = [];
  
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
  
  // Shuffle comments for variety
  const shuffledComments = [...allComments].sort(() => 0.5 - Math.random());
  
  // Get the carousel elements
  const carouselInner = document.querySelector(`#${role}-comment-carousel .carousel-inner`);
  const carouselIndicators = document.querySelector(`#${role}-comment-carousel .carousel-indicators`);
  
  // Clear existing content
  carouselInner.innerHTML = '';
  carouselIndicators.innerHTML = '';
  
  // Add comments to carousel
  shuffledComments.forEach((comment, i) => {
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
  renderCommentCarousel(filteredData, role);
}

function initializeFilters(data, role) {
  // Get unique years across all courses
  const allYears = new Set();
  data.courses.forEach(course => {
    course.years.forEach(year => allYears.add(year));
  });
  
  // Sort years in ascending order
  const years = Array.from(allYears).sort();
  
  // Create year filter buttons
  const yearFiltersContainer = document.getElementById(`${role}-year-filters`);
  years.forEach(year => {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm btn-outline-primary m-1 ${role}-year-filter active`;
    btn.textContent = year;
    btn.dataset.year = year;
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      updateCharts(role);
    });
    yearFiltersContainer.appendChild(btn);
  });
  
  // Create course filter buttons
  const courseFiltersContainer = document.getElementById(`${role}-course-filters`);
  data.courses.forEach(course => {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm btn-outline-secondary m-1 ${role}-course-filter active`;
    btn.textContent = course.name.split(' - ')[0]; // Just the course code
    btn.dataset.courseId = course.id;
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      updateCharts(role);
    });
    courseFiltersContainer.appendChild(btn);
  });
  
  // Add "Select All" buttons
  const allYearsBtn = document.createElement('button');
  allYearsBtn.className = 'btn btn-sm btn-primary m-1';
  allYearsBtn.textContent = 'All Years';
  allYearsBtn.addEventListener('click', function() {
    const yearBtns = document.querySelectorAll(`.${role}-year-filter`);
    const allActive = Array.from(yearBtns).every(btn => btn.classList.contains('active'));
    
    yearBtns.forEach(btn => {
      if (allActive) {
        btn.classList.remove('active');
      } else {
        btn.classList.add('active');
      }
    });
    updateCharts(role);
  });
  yearFiltersContainer.insertBefore(allYearsBtn, yearFiltersContainer.firstChild);
  
  const allCoursesBtn = document.createElement('button');
  allCoursesBtn.className = 'btn btn-sm btn-secondary m-1';
  allCoursesBtn.textContent = 'All Courses';
  allCoursesBtn.addEventListener('click', function() {
    const courseBtns = document.querySelectorAll(`.${role}-course-filter`);
    const allActive = Array.from(courseBtns).every(btn => btn.classList.contains('active'));
    
    courseBtns.forEach(btn => {
      if (allActive) {
        btn.classList.remove('active');
      } else {
        btn.classList.add('active');
      }
    });
    updateCharts(role);
  });
  courseFiltersContainer.insertBefore(allCoursesBtn, courseFiltersContainer.firstChild);
}

// Create global variables for charts
const charts = {
  lecturer: {
    barChart: null,
    radarChart: null,
    wordCloud: null
  },
  ta: {
    barChart: null,
    radarChart: null,
    wordCloud: null
  }
};

function renderCharts(data, role) {
  // Initial chart rendering
  renderBarChart(data, role);
  renderRadarChart(data, role);
  renderWordCloud(data, role);
  renderCommentCarousel(data, role); // Add this line
  
  // Set up update function
  if (!window.updateChartsForRole) {
    window.updateChartsForRole = {};
  }
  
  window.updateChartsForRole[role] = function() {
    const selectedYears = Array.from(document.querySelectorAll(`.${role}-year-filter.active`))
      .map(btn => parseInt(btn.dataset.year));
    
    const selectedCourses = Array.from(document.querySelectorAll(`.${role}-course-filter.active`))
      .map(btn => btn.dataset.courseId);
    
    const filteredData = filterData(data, selectedYears, selectedCourses);
    updateBarChart(filteredData, role);
    updateRadarChart(filteredData, role);
    updateWordCloud(filteredData, role);
    updateCommentCarousel(filteredData, role); // Add this line
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
      return {
        ...course,
        evaluations: course.evaluations.filter(eval => years.includes(eval.year))
      };
    })
  };
  
  return result;
}

function renderBarChart(data, role) {
  const ctx = document.getElementById(`${role}-overall-ratings-chart`).getContext('2d');
  
  // Process data for the chart
  const chartData = processDataForBarChart(data);
  
  charts[role].barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Overall Ratings by Course and Year'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          title: {
            display: true,
            text: 'Rating (out of 5)'
          }
        }
      }
    }
  });
}

function processDataForBarChart(data) {
  // Group data by course, then by year
  const labels = [];
  const datasets = [];
  
  // Create a color palette
  const colors = [
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 99, 132, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)'
  ];
  
  // For each course, create a dataset
  data.courses.forEach((course, i) => {
    const dataPoints = [];
    
    course.evaluations.forEach(eval => {
      // Add year-term to labels if not already present
      const yearLabel = `${eval.year} ${eval.term}`;
      if (!labels.includes(yearLabel)) {
        labels.push(yearLabel);
      }
      
      // Sort labels chronologically
      labels.sort((a, b) => {
        const yearA = parseInt(a.split(' ')[0]);
        const yearB = parseInt(b.split(' ')[0]);
        if (yearA !== yearB) return yearA - yearB;
        return a.localeCompare(b);
      });
      
      // Set data point at the correct position
      const dataIndex = labels.indexOf(yearLabel);
      dataPoints[dataIndex] = eval.metrics.overall_rating;
    });
    
    // Fill in missing data points with null
    const filledDataPoints = [];
    for (let i = 0; i < labels.length; i++) {
      filledDataPoints[i] = dataPoints[i] !== undefined ? dataPoints[i] : null;
    }
    
    datasets.push({
      label: course.name.split(' - ')[0],
      data: filledDataPoints,
      backgroundColor: colors[i % colors.length],
      borderColor: colors[i % colors.length].replace('0.7', '1'),
      borderWidth: 1
    });
  });
  
  return { labels, datasets };
}

function updateBarChart(filteredData, role) {
  const chartData = processDataForBarChart(filteredData);
  
  charts[role].barChart.data.labels = chartData.labels;
  charts[role].barChart.data.datasets = chartData.datasets;
  charts[role].barChart.update();
}

function renderRadarChart(data, role) {
  const ctx = document.getElementById(`${role}-metrics-radar-chart`).getContext('2d');
  
  // Process data for the chart
  const chartData = processDataForRadarChart(data);
  
  charts[role].radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Knowledge', 'Communication', 'Feedback', 'Availability', 'Overall Rating'],
      datasets: chartData
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Teaching Metrics Breakdown'
        }
      },
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function processDataForRadarChart(data) {
  // Create a color palette
  const colors = [
    'rgba(54, 162, 235, 0.5)',
    'rgba(255, 99, 132, 0.5)',
    'rgba(75, 192, 192, 0.5)',
    'rgba(255, 206, 86, 0.5)',
    'rgba(153, 102, 255, 0.5)',
    'rgba(255, 159, 64, 0.5)',
    'rgba(199, 199, 199, 0.5)'
  ];
  
  const datasets = [];
  
  // For each course
  data.courses.forEach((course, i) => {
    course.evaluations.forEach(eval => {
      const dataset = {
        label: `${course.name.split(' - ')[0]} (${eval.year} ${eval.term})`,
        data: [
          eval.metrics.knowledge,
          eval.metrics.communication,
          eval.metrics.feedback,
          eval.metrics.availability,
          eval.metrics.overall_rating
        ],
        backgroundColor: colors[i % colors.length],
        borderColor: colors[i % colors.length].replace('0.5', '1'),
        borderWidth: 1
      };
      
      datasets.push(dataset);
    });
  });
  
  return datasets;
}

function updateRadarChart(filteredData, role) {
  const chartData = processDataForRadarChart(filteredData);
  charts[role].radarChart.data.datasets = chartData;
  charts[role].radarChart.update();
}

function renderWordCloud(data, role) {
  const container = document.getElementById(`${role}-comment-word-cloud`);
  
  // Get all comments
  const allComments = [];
  data.courses.forEach(course => {
    course.evaluations.forEach(eval => {
      allComments.push(...eval.comments);
    });
  });
  
  // Generate word frequency
  const words = processCommentsForWordCloud(allComments);
  
  // Use D3.js for the word cloud
  charts[role].wordCloud = d3.layout.cloud()
    .size([500, 300])
    .words(words.map(d => ({ text: d.word, size: 10 + d.count * 5 })))
    .padding(5)
    .rotate(() => ~~(Math.random() * 2) * 90)
    .font("Impact")
    .fontSize(d => d.size)
    .on("end", drawWordCloud(container))
    .start();
}

function drawWordCloud(container) {
  return function(words) {
    container.innerHTML = "";
    
    const svg = d3.select(container)
      .append("svg")
        .attr("width", 500)
        .attr("height", 300)
        .attr("class", "mx-auto d-block")
      .append("g")
        .attr("transform", "translate(250,150)");
        
    svg.selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Impact")
        .style("fill", (d, i) => d3.schemeCategory10[i % 10])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text);
  };
}

function processCommentsForWordCloud(comments) {
  // Common English words to filter out
  const stopWords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 
    'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
    'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
    'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
    'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no',
    'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves',
    'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
    'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to',
    'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
    'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
  ]);
  
  // Count word frequencies
  const wordCounts = {};
  comments.forEach(comment => {
    const words = comment.toLowerCase().match(/\b(\w+)\b/g) || [];
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });
  
  // Convert to array and sort by frequency
  const wordArray = Object.keys(wordCounts).map(word => ({
    word,
    count: wordCounts[word]
  }));
  
  return wordArray.sort((a, b) => b.count - a.count).slice(0, 50); // Top 50 words
}

function updateWordCloud(filteredData, role) {
  // Get filtered comments
  const filteredComments = [];
  filteredData.courses.forEach(course => {
    course.evaluations.forEach(eval => {
      filteredComments.push(...eval.comments);
    });
  });
  
  // Generate word frequency from filtered comments
  const words = processCommentsForWordCloud(filteredComments);
  
  // Update the word cloud
  const container = document.getElementById(`${role}-comment-word-cloud`);
  
  // Create new word cloud
  charts[role].wordCloud
    .words(words.map(d => ({ text: d.word, size: 10 + d.count * 5 })))
    .on("end", drawWordCloud(container))
    .start();
}
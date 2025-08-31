// Calculate and plot solar vs utility costs over time

document.addEventListener('DOMContentLoaded', () => {
  const billInput = document.getElementById('bill');
  const solarInput = document.getElementById('solarPayment');
  const yearsRange = document.getElementById('yearsRange');
  const yearsDisplay = document.getElementById('yearsDisplay');
  // Fixed utility annual rate increase (9% per year)
  const UTILITY_RATE = 0.09;
  const solarEscalatorSelect = document.getElementById('solarEscalator');
  const totalUtilityEl = document.getElementById('totalUtility');
  const totalSolarEl = document.getElementById('totalSolar');
  const savingsEl = document.getElementById('savings');
  const yearlyDetailsEl = document.getElementById('yearlyDetails');
  const canvas = document.getElementById('costChart');
  const ctx = canvas.getContext('2d');
  // Ensure canvas dimensions match its rendered size
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  function updateYearsDisplay() {
    yearsDisplay.textContent = yearsRange.value;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  function drawChart(labels, utilityData, solarData) {
    // Resize canvas to account for responsive width/height
    resizeCanvas();
    const w = canvas.width;
    const h = canvas.height;
    // Padding for axes
    const padLeft = 50;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 50;
    ctx.clearRect(0, 0, w, h);
    // Compute max value for scaling
    const allValues = utilityData.concat(solarData);
    const maxVal = Math.max(...allValues) * 1.1 || 1; // add 10% padding
    const yScale = (h - padTop - padBottom) / maxVal;
    const xCount = labels.length;
    const xScale = xCount > 1 ? (w - padLeft - padRight) / (xCount - 1) : 0;
    // Draw axes
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    // y-axis
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, h - padBottom);
    ctx.stroke();
    // x-axis
    ctx.beginPath();
    ctx.moveTo(padLeft, h - padBottom);
    ctx.lineTo(w - padRight, h - padBottom);
    ctx.stroke();
    // Y-axis ticks and labels (5 ticks)
    ctx.fillStyle = '#444';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const value = (maxVal / tickCount) * i;
      const y = h - padBottom - yScale * value;
      ctx.beginPath();
      ctx.moveTo(padLeft - 5, y);
      ctx.lineTo(padLeft, y);
      ctx.stroke();
      ctx.fillText(formatCurrency(value).replace(/\.00$/, ''), padLeft - 10, y);
    }
    // X-axis labels: only draw a subset to avoid overlap
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    // Determine label frequency such that no more than 10 labels appear
    const maxLabels = 10;
    const step = Math.max(1, Math.ceil(labels.length / maxLabels));
    for (let i = 0; i < labels.length; i++) {
      if (i % step === 0 || i === labels.length - 1) {
        const x = padLeft + xScale * i;
        ctx.fillText(labels[i], x, h - padBottom + 5);
      }
    }
    // Draw lines for utility and solar
    function drawLine(data, color) {
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = padLeft + xScale * i;
        const y = h - padBottom - data[i] * yScale;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // Fill areas under lines lightly
    function fillArea(data, color) {
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = padLeft + xScale * i;
        const y = h - padBottom - data[i] * yScale;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      // Close the shape down to x-axis
      ctx.lineTo(padLeft + xScale * (data.length - 1), h - padBottom);
      ctx.lineTo(padLeft, h - padBottom);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
    // Utility area and line
    fillArea(utilityData, '#e53935');
    drawLine(utilityData, '#e53935');
    // Solar area and line
    fillArea(solarData, '#2e7d32');
    drawLine(solarData, '#2e7d32');
    // Draw legend
    const legendX = w - padRight - 120;
    const legendY = padTop;
    const lineHeight = 18;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e53935';
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = '#444';
    ctx.fillText('Utility Cost', legendX + 18, legendY + 6);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(legendX, legendY + lineHeight, 12, 12);
    ctx.fillStyle = '#444';
    ctx.fillText('Solar Cost', legendX + 18, legendY + lineHeight + 6);
  }

  function calculateCosts() {
    const monthlyBill = parseFloat(billInput.value) || 0;
    const solarMonthly = parseFloat(solarInput.value) || 0;
    const years = parseInt(yearsRange.value, 10) || 0;
    const utilityRate = UTILITY_RATE;
    const solarEscalator = parseFloat(solarEscalatorSelect.value) / 100 || 0;

    const labels = [];
    const utilityAnnualCosts = [];
    const solarAnnualCosts = [];
    let totalUtility = 0;
    let totalSolar = 0;

    for (let year = 0; year < years; year++) {
      const utilityMonthlyForYear = monthlyBill * Math.pow(1 + utilityRate, year);
      const solarMonthlyForYear = solarMonthly * Math.pow(1 + solarEscalator, year);
      const utilityAnnual = utilityMonthlyForYear * 12;
      const solarAnnual = solarMonthlyForYear * 12;
      totalUtility += utilityAnnual;
      totalSolar += solarAnnual;
      labels.push(`Year ${year + 1}`);
      utilityAnnualCosts.push(utilityAnnual);
      solarAnnualCosts.push(solarAnnual);
    }

    totalUtilityEl.textContent = formatCurrency(totalUtility);
    totalSolarEl.textContent = formatCurrency(totalSolar);
    const difference = totalUtility - totalSolar;
    savingsEl.textContent = formatCurrency(difference);

    // Update yearly snapshot for the selected timeline
    if (years > 0) {
      const index = years - 1;
      const currentUtilityMonthly = monthlyBill * Math.pow(1 + utilityRate, index);
      const currentSolarMonthly = solarMonthly * Math.pow(1 + solarEscalator, index);
      const monthSavings = currentUtilityMonthly - currentSolarMonthly;
      const yearSavings = utilityAnnualCosts[index] - solarAnnualCosts[index];
      yearlyDetailsEl.textContent =
        `Year ${years}: Utility monthly cost ${formatCurrency(currentUtilityMonthly)}, ` +
        `Solar monthly cost ${formatCurrency(currentSolarMonthly)}, ` +
        `Monthly savings ${formatCurrency(monthSavings)}, ` +
        `Annual savings ${formatCurrency(yearSavings)}`;
    } else {
      yearlyDetailsEl.textContent = 'Select a timeline to view annual costs.';
    }

    drawChart(labels, utilityAnnualCosts, solarAnnualCosts);
  }

  // Event listeners for inputs
  billInput.addEventListener('input', calculateCosts);
  solarInput.addEventListener('input', calculateCosts);
  yearsRange.addEventListener('input', () => {
    updateYearsDisplay();
    calculateCosts();
  });
  solarEscalatorSelect.addEventListener('change', calculateCosts);

  // Handle window resize to redraw chart
  window.addEventListener('resize', calculateCosts);

  // Initialize display and chart
  updateYearsDisplay();
  calculateCosts();
});
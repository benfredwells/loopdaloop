var selectedCategory;
var selectedContourGroupRow;

function hoverCategory() {
  this.classList.add('hover');
}

function unHoverCategory() {
  this.classList.remove('hover');
}

function selectCategory() {
  if (selectedCategory)
    selectedCategory.classList.remove('selected');
  selectedCategory = this;
  this.classList.add('selected');
}

function hoverContourGroupRow() {
  this.classList.add('hover');
}

function unHoverContourGroupRow() {
  this.classList.remove('hover');
}

function makeContourGroupRowSelected(groupRow, selected) {
  var rowClass = groupRow.getAttribute('rowClass');
  var rows = document.getElementsByClassName(rowClass);
  for (var i = 0; i < rows.length; i++) {
    row = rows[i];
    row.hidden = !selected;
  }
  if (selected)
    groupRow.classList.add('selected');
  else
    groupRow.classList.remove('selected');
}

function selectContourGroupRow() {
  if (selectedContourGroupRow == this) {
    makeContourGroupRowSelected(this, false);
    selectedContourGroupRow = null; 
  } else {
    if (selectedContourGroupRow)
      makeContourGroupRowSelected(selectedContourGroupRow, false);
    selectedContourGroupRow = this;
    makeContourGroupRowSelected(selectedContourGroupRow, true);
  }
}

function hideAllContourRows() {
  var contourRows = document.getElementsByClassName('contourRow');
  for (var i = 0; i < contourRows.length; i++) {
    row = contourRows[i];
    row.hidden = true;
  }
}

function init() {
  var categories = document.getElementsByClassName('synthCategory');
  for (var i = 0; i < categories.length; i++) {
    var el = categories[i];
    el.onmouseenter = hoverCategory;
    el.onmouseleave = unHoverCategory;
    el.onclick = selectCategory;
  };
  selectedCategory = document.getElementById('pitch');
  var rows = document.getElementsByClassName('contourGroupRow');
  for (var i = 0; i < rows.length; i++) {
    var el = rows[i];
    el.onmouseenter = hoverContourGroupRow;
    el.onmouseleave = unHoverContourGroupRow;
    el.onclick = selectContourGroupRow;
  };
  hideAllContourRows();
}

window.onload = init;
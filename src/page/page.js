const fileViewWrapper = document.getElementById('file-view-wrapper');
const fileUploadLoader = document.getElementById('file-upload-loader');

const buttonLoad = document.getElementById('button-load');
const inputFile = document.getElementById('input-file');
const note = document.getElementById('note');

let json;

inputFile.addEventListener('change', (e) => {
  console.log(inputFile.files);
  fileUploadLoader.innerHTML = 'Loading file...';
  const reader = new FileReader();
  reader.readAsText(inputFile.files[0]);
  reader.onload = () => {
    console.log('file content loaded');
    json = window.exporter.parseXml(reader.result);
    console.log('file parsed');
    renderRoot();
    fileUploadLoader.innerHTML = '';
    fileViewWrapper.style.display = 'initial';
  };
});

buttonLoad.addEventListener('click', () => {
  fileViewWrapper.style.display = 'none';
  inputFile.click();
});

function removeAllChildren(parent) {
  if (parent.hasChildNodes()) {
    for (let i = parent.childNodes.length - 1; i >= 0; i--) {
      if (parent.childNodes[i].nodeName !== '#text')
        parent.removeChild(parent.childNodes[i]);
    }
  }
}

function isArrayOrObject(value) {
  return typeof value === 'object' || Array.isArray(value);
}

function tree(el, object, path) {
  removeAllChildren(el);

  const parent = document.createElement('ul');
  Object.entries(object).forEach(([key, value]) => {
    const node = document.createElement('li');
    if (isArrayOrObject(value)) {
      node.innerHTML = key;
      node.style.cursor = 'pointer';
      node.style.color = '#74a9f6';
      node.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.children.length) {
          removeAllChildren(e.target);
        } else {
          tree(e.target, value);
        }
      });
      if (path && path[0] === key) {
        const [_, ...p] = path;
        tree(node, value, p);
      }
    } else {
      const text = `${key}: ${value}`;
      node.innerHTML = text;
      node.style.cursor = 'not-allowed';
      node.style.color = '#ff79c6';

      if (path && path.length === 2) {
        if (text.includes(path[1])) {
          node.style.color = '#ffed79';
          node.id = 'search-highlight';
        }
      }

      node.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }
    parent.appendChild(node);
  });
  el.appendChild(parent);
}

function renderRoot() {
  tree(
    document.getElementById('file-content'),
    json,
    occurances.length ? occurances[occuranceIndex] : null
  );
  const searchHighlight = document.getElementById('search-highlight');
  if (searchHighlight)
    searchHighlight.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
}

const inputSearch = document.getElementById('input-search');
const buttonSearch = document.getElementById('button-search');
const buttonClear = document.getElementById('button-clear');
const searchCount = document.getElementById('search-count');
const buttonNext = document.getElementById('button-next');
const buttonPrev = document.getElementById('button-prev');

let occurances = [];
let occuranceIndex = 0;

buttonSearch.addEventListener('click', () => {
  console.log('search');
  const query = inputSearch.value;
  occurances = [];
  findInObject(json, query, []);
  if (occurances.length > 0) {
    occuranceIndex = 0;
    searchCount.innerHTML = `${occuranceIndex + 1} of ${occurances.length}`;
    renderRoot();
  } else {
    searchCount.innerHTML = 'Not found';
  }
});

buttonClear.addEventListener('click', () => {
  searchCount.innerHTML = '';
  inputSearch.value = '';
  occurances = [];
  occuranceIndex = 0;
  renderRoot();
});

buttonPrev.addEventListener('click', () => {
  const ol = occurances.length;
  occuranceIndex = (((occuranceIndex - 1) % ol) + ol) % ol;
  searchCount.innerHTML = `${occuranceIndex + 1} of ${occurances.length}`;
  renderRoot();
});

buttonNext.addEventListener('click', () => {
  const ol = occurances.length;
  occuranceIndex = (occuranceIndex + 1) % ol;
  searchCount.innerHTML = `${occuranceIndex + 1} of ${occurances.length}`;
  renderRoot();
});

function findInObject(object, query, path) {
  Object.entries(object).forEach(([key, value]) => {
    const p = [...path, key];
    if (isArrayOrObject(value)) {
      if (key.includes(query)) {
        p.push(query);
        occurances.push(p);
      } else {
        findInObject(value, query, p);
      }
    } else {
      if (String(value).includes(query)) {
        p.push(query);
        occurances.push(p);
      }
    }
  });
}

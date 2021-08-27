const download = (url: string) => {
  const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = () => {
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(xhr.response);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
  };
  xhr.open('GET', url);
  xhr.send();
};

export default download;

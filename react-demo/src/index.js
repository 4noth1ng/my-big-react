import React from 'react';
import ReactDOM from 'react-dom'


const jsx = <div><span>big-react</span></div>
console.log(React);
console.log(jsx);
console.log(ReactDOM);

const root = document.querySelector('#root')
ReactDOM.createRoot(root).render(jsx)
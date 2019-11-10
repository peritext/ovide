
import React from 'react';
import {renderToString} from 'react-dom/server';

self.addEventListener('message', (event) => {
  const {data} = event;
  const {payload, type} = data;
  switch(type) {
    case 'render-component-to-string':
    default:
      const test = renderToString(<div>coucou</div>)
      self.postMessage({
        type: 'html-rendered',
        payload: {
          html: test
        }
      })
      break;
  }
  // console.log('in worker', event.data)
  // self.postMessage({count: event.data.count + 1})
})

// setTimeout(() => self.postMessage({ foo: 'foo' }), 500)
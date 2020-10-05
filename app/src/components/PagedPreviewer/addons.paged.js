/* eslint-disable */

/**
 * DOM observer use to retrigger the resize script when changing content in the page
 */
if (!window.observeDOM) {
  window.observeDOM = ( function() {
      const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  
      return function( obj, callback ) {
        if ( !obj || !obj.nodeType === 1 ) return; // validation
  
        if ( MutationObserver ) {
          // define a new observer
          const obs = new MutationObserver( function( mutations, observer ) {
              callback( mutations );
          } );
          // have the observer observe foo for changes in children
          obs.observe( obj, { childList: true, subtree: true } );
        }
  
        else if ( window.addEventListener ) {
          obj.addEventListener( 'DOMNodeInserted', callback, false );
          obj.addEventListener( 'DOMNodeRemoved', callback, false );
        }
      };
    } )();
  }
  
  if ( window.Paged ) {
  
        /*
         * Hooks for paged.js
         * footnotes support courtesy of RLesur https://github.com/rstudio/pagedown/blob/master/inst/resources/js/hooks.js
         * Footnotes support
         */
          Paged.registerHandlers( class extends Paged.Handler {
          constructor( chunker, polisher, caller ) {
            super( chunker, polisher, caller );
  
            this.splittedParagraphRefs = [];
          }
  
          beforeParsed( content ) {
            // console.info('hiding no-page-overflow-y items');
            // const noOverflow = document.querySelectorAll('.pagedjs_no-page-overflow-y');
            //   // // trick for lateral items
            //   // // @todo find a cleaner way to do this 2
            //   [].forEach.call(noOverflow, item => {
            //     item.style.display = 'none';          
            //   })
  
            console.info( 'spotting footnotes' );
            const footnotes = content.querySelectorAll( '.footnote' );
            for ( const footnote of footnotes ) {
              const parentElement = footnote.parentElement;
              const footnoteCall = document.createElement( 'a' );
              const footnoteNumber = footnote.dataset.notenumber;
              const before = footnote.previousSibling;
              let beforeText ='';
              if (before) {
                beforeText = before.textContent;
              }
              const after = footnote.nextSibling;
              let afterText = '';
              if (after) {
                afterText = after.textContent;
              }
              /**
               * getting 3 words before and after the note to make sure they are displayed together
               * */
              let charIndex = beforeText.length;
              let wordIndex = 0;
              const DISPLACEMENT = 1;
              const MIN_CHARS = 2;
              // get some text before
              while (charIndex > 0 && (wordIndex < DISPLACEMENT || `${beforeText.charAt(charIndex)}`.match(/[\w'’éèàçù\u00AD,]/))) {
                if (charIndex < beforeText.length - MIN_CHARS && !`${beforeText.charAt(charIndex)}`.match(/[\w'’éèàçù\u00AD,]/)) {
                  wordIndex ++;
                }
                  charIndex --;
              }
              const appendBefore = beforeText.substr(charIndex);
              const newBeforeText = beforeText.substr(0, charIndex);
              // get some text after
              charIndex = 0;
              wordIndex = 0;
              while(charIndex < afterText.length && (wordIndex < DISPLACEMENT || `${afterText.charAt(charIndex)}`.match(/[\S\w'’éèàçù,\u00AD]/))) {
                if (charIndex > MIN_CHARS && !`${afterText.charAt(charIndex)}`.match(/[\w'’éèàçù\u00AD]/)) {
                  wordIndex ++;
                }
                // if (wordIndex < DISPLACEMENT) {
                  charIndex ++;
                // }
              }
              
              const appendAfter = afterText.substr(0, charIndex);
              const newAfterText = afterText.substr(charIndex);
              // shorten siblings texts
              if (before) {
                before.textContent = newBeforeText;
              }
              if (after) {
                after.textContent = newAfterText;
              }
  
  
              footnoteCall.className = 'footnote-ref'; // same class as Pandoc
              footnoteCall.setAttribute( 'id', `fnref${ footnoteNumber}` ); // same notation as Pandoc
              footnoteCall.setAttribute( 'href', `#${ footnote.id}` );
              footnoteCall.innerHTML = `<sup id="note-content-pointer-${ footnote.id }">${ footnoteNumber }</sup>`;
              // wrapping the call with previous element
              // to avoid orphan footnote call
              const callWrapper = document.createElement('span');
              callWrapper.className= "footnote-call-wrapper";
              // callWrapper.style = 'page-break-inside:avoid;break-inside:avoid;';
              callWrapper.innerHTML = `${appendBefore}${footnoteCall.outerHTML}${appendAfter}`
              parentElement.insertBefore( callWrapper, footnote );
              // parentElement.insertBefore( footnoteCall, footnote );
  
              // Here comes a hack. Fortunately, it works with Chrome and FF.
              const handler = document.createElement( 'div' );
              handler.className = 'footnoteHandler';
              parentElement.insertBefore( handler, footnote );
              handler.appendChild( footnote );
              handler.style.display = 'inline';
              handler.style.width = '100%';
              handler.style.float = 'right';
              handler.style.margin = '0';
              // handler.style.pageBreakInside = 'avoid';
            }
          }
  
          afterParsed() {
            console.info( 'parsing finished, rendering the pages' );
            console.group( 'rendering pages' );
  
            if (window.Toastify) {
              Toastify( {
                text: 'Rendering pages',
                duration: 2000
              } ).showToast();
            }
          }
  
          afterPageLayout( pageFragment, page, breakToken ) {
            console.info( 'page %s is rendered', page.position + 1 );
            if (page.position%20 === 0 && page.position && Toastify) {
              Toastify( {
                text: 'Rendering pages : ' + (page.position) + '/?',
                duration: 1000
              } ).showToast();
            }
  
            function hasItemParent( node ) {
              if ( node.parentElement === null ) {
                return false;
              }
            else {
                if ( node.parentElement.tagName === 'LI' ) {
                  return true;
                }
              else {
                  return hasItemParent( node.parentElement );
                }
              }
            }
  
            /*
             * If a li item is broken, we store the reference of the p child element
             * see https://github.com/rstudio/pagedown/issues/23#issue-376548000
             */
            if ( breakToken !== undefined ) {
              if ( breakToken.node.nodeName === '#text' && hasItemParent( breakToken.node ) ) {
                this.splittedParagraphRefs.push( breakToken.node.parentElement.dataset.ref );
              }
            }
          }
  
          afterRendered( pages ) {
            
            console.groupEnd( 'rendering pages' );
            [].forEach.call(document.querySelectorAll('.unstyled'), el => {
              [].forEach.call(el.childNodes, (child, index) => {
                if (child.nodeType === 8) {
                 child.remove();
                }
              })
            });
            [].forEach.call(document.querySelectorAll('.unstyled'), el => {
              let index = 0;
              while (index < el.childNodes.length) {
                const child = el.childNodes[index];
                if (child.nodeType === 3 && el.childNodes[index + 1] && el.childNodes[index + 1].nodeType === 3) {
                    let data = child.data;
                    index ++;
                    while (el.childNodes[index] && el.childNodes[index].nodeType === 3) {
                      data += el.childNodes[index].data;
                      el.childNodes[index].remove();
                      // index ++;
                      // console.log('concat');
                    }
                    child.data = data;
                   // el.childNodes[index + 1].data = child.data +  el.childNodes[index + 1].data;
                }
                index++;
              }
            });
            if (window.Toastify) {
              Toastify( {
                text: `Attaching footnotes to ${ pages.length } pages`,
                duration: 1000
              } ).showToast();
            }
            console.info( 'rendering done, attaching footnotes to %s pages', pages.length );
            let footnoteIndex = 0;
            for ( let i = 0 ; i < pages.length ; i ++ ) {
  
              const page = pages[i]
              // trick for hyphens
              // const hyphenates = document.querySelectorAll('.pagedjs_hyphen');
              // for (let n = 0 ; n < hyphenates.length ; n++) {
              //   const item = hyphenates[n].lastChild;
              //   if (item.nodeType === 3 && item.data && item.data.match(/­‑$/)) {
              //     item.data = item.data.substr(0, item.data.length - 1);
              //   }
              // }
              // handle footnote at end
              const content = page.element.querySelector('.pagedjs_page_content .rendered-content');
              const lastChild = content && content.lastChild && content.lastChild.lastChild;
              
              /**
               * @todo improve footnotes handling
               */
              if (lastChild && lastChild.className === 'footnoteHandler') {
                // 1. get width to fill
                // get element before footnote handler
                const before = lastChild.previousSibling;
                // get last child
                const beforeLastChild = before.lastChild;
                let container = before.parentNode;
                const containerWidth = container.getBoundingClientRect().x + container.getBoundingClientRect().width;
                const beforeLastChildContainer = document.createElement('span');
                beforeLastChildContainer.append(beforeLastChild);
                const placeholder = document.createElement('span');
                beforeLastChildContainer.appendChild(placeholder);
                before.appendChild(beforeLastChildContainer);
                const elementWidth = placeholder.getBoundingClientRect().x + placeholder.getBoundingClientRect().width;
                let remaining = containerWidth - elementWidth;
                // 2. get content next page
                const nextPage = pages[i + 1];
                if (nextPage) {
                  const nextArea = nextPage.area.querySelector('.rendered-content > *');
                  const nodes = nextArea.childNodes;
                  for (let i = 0 ; i < nodes.length ; i ++) {
                    const node = nodes[i];
                    if (!node.className || !node.className.includes('footnoteHandler')) {
                      let finalNode = node;
                      if (node.nodeType === 3) {
                        const parts = node.data.split(/\s/);
                        const tempWrapper = document.createElement('span');
                        document.body.appendChild(tempWrapper);
                        tempWrapper.innerHTML = '';
                        let finalK = 0;
                        for (let k = 0 ; k < parts.length ; k ++) {
                          let text = k === 0 ? parts[k] : ' ' + parts[k];
                          tempWrapper.innerHTML = tempWrapper.innerHTML + text;
                          const finalNodeDims = tempWrapper.getBoundingClientRect();
                          if (finalNodeDims.width < remaining) {
                            finalK++;
                          } else {
                            tempWrapper.innerHTML = tempWrapper.innerHTML.substring(0, tempWrapper.innerHTML.length - text.length)
                            break;
                          }
                        }
                        remaining -= tempWrapper.getBoundingClientRect().width;
                        node.data = parts.slice(finalK).join(' ')
                        before.appendChild(tempWrapper);
                          
                      } else {
                        if (node.getBoundingClientRect().width <= remaining) {
                          before.appendChild(node);
                          remaining -= node.getBoundingClientRect().width;
                        } else {
                          break;
                        }
                      }
                    }
                  }
                }
              }
              
              // reset note number when changing section
              if (page.element.className.includes('pagedjs_section_first_page')) {
                console.log('reset footnote number');
                footnoteIndex = 0;
              }
              // const footnotesRefs = page.element.querySelectorAll( '.footnote-ref' );
              const footnotes = page.element.querySelectorAll( '.footnote' );
              if ( footnotes.length === 0 ) {
                continue;
              }
  
              const pageContent = page.element.querySelector( '.pagedjs_page_content' );
              // const last = pageContent.querySelector('.rendered-content > *:last-of-type');
              // console.log('last', last)
              const hr = document.createElement( 'hr' );
              const footnoteArea = document.createElement( 'div' );
  
              pageContent.style.display = 'flex';
              pageContent.style.flexDirection = 'column';
  
              hr.className = 'footnote-break';
              hr.style.marginTop = 'auto';
              hr.style.marginBottom = 0;
              hr.style.marginLeft = 0;
              hr.style.marginRight = 'auto';
              pageContent.appendChild( hr );
  
              footnoteArea.className = 'footnote-area';
              pageContent.appendChild( footnoteArea );
              for ( const footnote of footnotes ) {
                // footnoteIndex++;
                const handler = footnote.parentElement;
  
                footnoteArea.appendChild( footnote );
                handler.parentNode.removeChild( handler );
  
                const footnoteCall = document.getElementById( `note-content-pointer-${ footnote.id}` );
                if (footnoteCall) {
                  let footnoteCallParent = footnoteCall.parentNode;
                  while(footnoteCallParent && !footnoteCallParent.className.includes('pagedjs_page ')) {
                    footnoteCallParent = footnoteCallParent.parentNode;
                  }
                  let footnoteAreaParent = footnoteArea.parentNode;
                  while(footnoteAreaParent && !footnoteAreaParent.className.includes('pagedjs_page ')) {
                    footnoteAreaParent = footnoteAreaParent.parentNode;
                  }
                  const callPage = footnoteCallParent.id;
                  const areaPage = footnoteAreaParent.id;
                  if (callPage === areaPage) {
                    footnoteIndex++;

                  }
                }
                if ( footnoteCall ) {
                  footnoteCall.innerHTML = `<sup id="note-content-pointer-${ footnote.id }">${ footnoteIndex }</sup>`;
                }
  
                footnote.innerHTML = `${footnote.id ? `<sup class="note-pointer"><a href="#note-content-pointer-${ footnote.id }">${ footnoteIndex }</a></sup>` : ''}${ footnote.innerHTML}`;
                // footnote.style.fontSize = 'x-small';
                footnote.style.marginTop = 0;
                footnote.style.marginBottom = 0;
                footnote.style.paddingTop = 0;
                footnote.style.paddingBottom = 0;
                footnote.style.display = 'block';
              }
            }
          //     for ( const footnote of footnotes ) {
          //     footnoteIndex++;
          //     const handler = footnote.parentElement;

          //     footnoteArea.appendChild( footnote );
          //     handler.parentNode.removeChild( handler );

          //     const footnoteCall = document.getElementById( `note-content-pointer-${ footnote.id}` );
          //     if ( footnoteCall ) {
          //       footnoteCall.innerHTML = `<sup id="note-content-pointer-${ footnote.id }">${ footnoteIndex }</sup>`;
          //     }

          //     footnote.innerHTML = `${footnote.id ? `<sup class="note-pointer"><a href="#note-content-pointer-${ footnote.id }">${ footnoteIndex }</a></sup>` : ''}${ footnote.innerHTML}`;
          //     // footnote.style.fontSize = 'x-small';
          //     footnote.style.marginTop = 0;
          //     footnote.style.marginBottom = 0;
          //     footnote.style.paddingTop = 0;
          //     footnote.style.paddingBottom = 0;
          //     footnote.style.display = 'block';
          //   }
          // }
  
            for ( const ref of this.splittedParagraphRefs ) {
              const paragraphFirstPage = document.querySelector( `[data-split-to="${ ref }"]` );
  
              /*
               * We test whether the paragraph is empty
               * see https://github.com/rstudio/pagedown/issues/23#issue-376548000
               */
              if ( paragraphFirstPage.innerText === '' ) {
                paragraphFirstPage.parentElement.style.display = 'none';
                const paragraphSecondPage = document.querySelector( `[data-split-from="${ ref }"]` );
                paragraphSecondPage.parentElement.style.setProperty( 'list-style', 'inherit', 'important' );
              }
  
            
            }
            console.info( 'footnotes positionning done' );
            /**
             * Custom dirty tricks
             */
            let divs = document.getElementsByTagName("div");
            const searchText = "⁂";
            for (var i = 0; i < divs.length; i++) {
              if (divs[i].textContent === searchText) {
                divs[i].style.textAlign = "center";
              }
            }
            divs = document.querySelectorAll(".unstyled em");
            for (var i = 0; i < divs.length; i++) {
              if (divs[i].textContent.trim().indexOf('—') === 0) {
                divs[i].parentNode.style.textIndent = 0;
              }
            }
            
            /**
             * list items
             */
            const lists = document.querySelectorAll('.mentions-list');
            for (var i = 0; i < lists.length; i++) {
              const list = lists[i];
              const links = list.querySelectorAll('.page-link');
              let targetsMap = [];
              for (var j = 0 ; j < links.length ; j++) {
                const link = links[j];
                const href = link.getAttribute('href');
                let target;
                try {
                  target = document.querySelector(href);
                } catch(e) {
  
                }
                if (target) {
                  let parent = target.parentNode;
                  let ok = true;
                  while (ok && parent && !parent.className.split(' ').find(part => part === 'pagedjs_page')) {
                    if (parent.parentNode) {
                      parent = parent.parentNode
                    } else {
                      ok = false;
                    }
                  }
                  const number = parent && parent.getAttribute('data-page-number') ? +parent.getAttribute('data-page-number') : undefined;
                  targetsMap.push({
                    element: link,
                    page: number
                  })
                }
              }
              targetsMap = targetsMap.sort((a, b) => {
                if (a.page > b.page) {
                  return 1;
                } else {
                  return -1;
                }
              })
              targetsMap.forEach((item, index) => {
                const next = index < targetsMap.length - 1? targetsMap[index + 1] : undefined;
                if (next) {
                  if (item.page === next.page) {
                    next.element.style.display = 'none';
                    next.hide = true;
                  }
                }
              })
              const finalHTML = targetsMap.map((item, index) => {
                if (index > 0 && !item.hide) {
                  return ', ' + item.element.outerHTML;
                } else {
                  return item.element.outerHTML;
                }
              }).join('');
              list.innerHTML = finalHTML
            }
            /**
             * If overflow adjustments handle them
             */
            setTimeout(() => {
              const noOverflow = document.querySelectorAll('.pagedjs_no-page-overflow-y');
              // // trick for lateral items
              // // @todo find a cleaner way to do this 2
              [].forEach.call(noOverflow, item => {
                item.style.display = 'block';          
              })
              // hacky : retrieving pages transform to apply it to overflow adjustments
              let pageScale = 1;
              const pagesContainer = document.querySelector( '.pagedjs_pages' )
              if (pagesContainer && pagesContainer.style.transform && pagesContainer.style.transform.match(/scale\((.+)\)/)) {
                pageScale = +pagesContainer.style.transform.match(/scale\((.+)\)/)[1];
              }
              [].forEach.call(noOverflow, (before, index1) => {
                [].forEach.call(noOverflow, (after, index2) => {
                  if (index1 < index2) {
                    if (before.parentNode.parentNode === after.parentNode.parentNode) {
                      const {top: yBefore, height: hBefore} = before.getBoundingClientRect();
                      const {top: yAfter, height: hAfter} = after.getBoundingClientRect();
                      if (yAfter >= yBefore && yAfter <= (yBefore + hBefore)) {
                        const absY = ((yAfter - yBefore) + hBefore) / pageScale;
                        before.parentNode.style.position = 'relative';
                        after.parentNode.style.position = 'relative';
                        after.style.top = absY + 10 + 'px';
                        // console.log({yBefore, yAfter, hBefore})
                      }
                    }
                  }
                })
              })
            }, 500)
            if(Toastify) {
              Toastify( {
                text: 'Rendering finished !',
                duration: 3000
              } ).showToast();
            }
            
          }
          } );/* end register handlers */
      // resize logic
      const paged = new window.Paged.Previewer();
      const resizer = () => {
        const pages = document.querySelector( '.pagedjs_pages' );
  
        if ( pages ) {
          const scale = ( ( window.innerWidth * .9 ) / pages.offsetWidth );
          if ( scale < 1 ) {
            const newWidth = pages.offsetWidth * scale;
            const newHeight = pages.offsetHeight * scale
            const translateX = (pages.offsetWidth - newWidth) / 2;
            const translateY = (pages.offsetHeight - newHeight) / 2;
            // console.log(pages.offsetHeight, translateY)
            const style = `translate(${ -translateX }px, ${-translateY}px) scale(${ scale }) `;
            pages.style.transform = style;
            // document.body.style.transform = style;
            // document.body.style['max-height'] = translateY;
          }
          else {
            document.body.style.transform = 'none';
          }
        }
      };
      resizer();
  
      window.addEventListener( 'resize', resizer, false );
  
      paged.on( 'rendering', () => {
        console.log( 'paged is rendering' );
        resizer();
      } );
      observeDOM( document.body, resizer );
  
    }
  
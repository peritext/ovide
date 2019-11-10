

/* Change the look */
:root {
  --color-background:  whitesmoke;
  --color-pageBox: #666;
  --color-paper: white;
  --color-marginBox: transparent;
}


/* To define how the book look on the screen: */
@media screen {
  body {
      background-color: var(--color-background);
  }
  .pagedjs_pages {
      display: flex;
      width: calc(var(--pagedjs-width) * 2);
      // width: 100%;
      flex: 0;
      flex-wrap: wrap;
      margin: 0 auto;
  }
  .pagedjs_page {
      background-color: var(--color-paper);
      box-shadow: 0 0 0 1px var(--color-pageBox);
      margin: 0;
      flex-shrink: 0;
      flex-grow: 0;
      margin-top: 10mm;
  }
  .pagedjs_first_page {
      margin-left: var(--pagedjs-width);
  }

  .pagedjs_page:last-of-type{ 
      margin-bottom: 10mm;
  }
}




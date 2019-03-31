import React, { Component } from 'react';
import PropTypes from 'prop-types';
import redraft from 'redraft';
import { constants } from 'peritext-schemas';

// import Link from './Link';

// import BlockAssetWrapper from './BlockAssetWrapper';
import InlineAssetWrapper from './InlineAssetWrapper';

/*
 * import NotePointer from './NotePointer';
 * import SectionLink from './SectionLink';
 */

const {

  /*
   * LINK,
   * BLOCK_ASSET,
   */
  INLINE_ASSET,
  // SECTION_POINTER,

  /*
   * NOTE_POINTER,
   */
} = constants.draftEntitiesNames;

// just a helper to add a <br /> after each block
const addBreaklines = ( children ) => children.map( ( child, index ) => [ child, <br key={ index + 1 } /> ] );

/**
 * Define the renderers
 */
const renderers = {

  /**
   * Those callbacks will be called recursively to render a nested structure
   */
  inline: {
    // The key passed here is just an index based on rendering order inside a block
    BOLD: ( children, { key } ) => <strong key={ key }>{children}</strong>,
    ITALIC: ( children, { key } ) => <em key={ key }>{children}</em>,
    UNDERLINE: ( children, { key } ) => <u key={ key }>{children}</u>,
    CODE: ( children, { key } ) => <span key={ key }>{children}</span>,
  },

  /**
   * Blocks receive children and depth
   * Note that children are an array of blocks with same styling,
   */
  blocks: {
    'unstyled': ( children, { keys } ) => children.map( ( child, index ) => (
      <div
        className={ 'unstyled' }
        id={ keys[index] }
        key={ index }
      >
        {child}
      </div>
    ) ),
    'blockquote': ( children, { keys } ) => <blockquote id={ keys[0] } >{addBreaklines( children )}</blockquote>,
    'header-one': ( children, { keys } ) => children.map( ( child, index ) => (
      <h1
        id={ keys[index] }
        key={ index }
      >
        {child}
      </h1>
    ) ),
    'header-two': ( children, { keys } ) => children.map( ( child, index ) => (
      <h2
        id={ keys[index] }
        key={ index }
      >
        {child}
      </h2>
    ) ),
    'header-three': ( children, { keys } ) => children.map( ( child, index ) => (
      <h3
        id={ keys[index] }
        key={ index }
      >
        {child}
      </h3>
    ) ),
    'header-four': ( children, { keys } ) => children.map( ( child, index ) => (
      <h4
        id={ keys[index] }
        key={ index }
      >
        {child}
      </h4>
    ) ),
    'header-five': ( children, { keys } ) => children.map( ( child, index ) => (
      <h5
        id={ keys[index] }
        key={ index }
      >
        {child}
      </h5>
    ) ),
    'header-six': ( children, { keys } ) => children.map( ( child, index ) => (
      <h6
        id={ keys[index] }
        key={ index }
      >
        {child}
      </h6>
    ) ),

    // You can also access the original keys of the blocks
    'code-block': ( children, { keys } ) => <pre key={ keys[0] } >{addBreaklines( children )}</pre>,
    // or depth for nested lists
    'unordered-list-item': ( children, { depth, keys } ) => (
      <ul
        key={ keys[keys.length - 1] }
        className={ `ul-level-${depth}` }
      >
        {
        children.map(
          ( child, index ) =>
            <li key={ index }>{child}</li>
        )
      }
      </ul>
    ),
    'ordered-list-item': ( children, { depth, keys } ) => (
      <ol
        key={ keys.join( '|' ) }
        className={ `ol-level-${depth}` }
      >
        {
          children.map(
            ( child, index ) =>
              <li key={ keys[index] }>{child}</li>
          )
        }
      </ol>
    ),

    /*
     * If your blocks use meta data it can also be accessed like keys
     * atomic: (children, { keys, data }) => children.map((child, i) => <Atomic key={keys[i]} {...data[i]}>{child}</Atomic>),
     */
  },

  /**
   * Entities receive children and the entity data
   */
  entities: {

  /*
   *   // key is the entity key value from raw
   * [LINK]: ( children, data, { key } ) =>
   *   (
   *     <Link
   *       key={ key }
   *       to={ data.url }
   *     >
   *       {children}
   *     </Link>
   *   ),
   * [BLOCK_ASSET]: ( children, data, { key } ) => {
   *   return (
   *     <BlockAssetWrapper
   *       key={ key }
   *       data={ data }
   *     >
   *       {children}
   *     </BlockAssetWrapper>
   *   );
   * },
   */
    [INLINE_ASSET]: ( children, data, { key } ) => {
      return (
        <InlineAssetWrapper
          data={ data }
          key={ key }
        >
          {children}
        </InlineAssetWrapper>
      );
    },
    ['MATCH_MARKER']: ( children, data, { key } ) => {
      return (
        <span
          key={ key }
          style={ { background: 'red', color: 'white' } }
        >
          {children}
        </span>
      );
    },
    ['MENTION_MARKER']: ( children, data, { key } ) => {
      return (
        <span
          key={ key }
          style={ { background: 'lightgreen', color: 'white' } }
        >
          {children}
        </span>
      );
    }

    /*
     * NOTE_POINTER: ( children, data, { key } ) => {
     *   return (
     *     <NotePointer
     *       key={ key }
     *       children={ children }
     *       noteId={ data.noteId }
     *     />
     *     );
     * },
     * [SECTION_POINTER]: ( children, data, { key } ) => {
     *   return (
     *     <SectionLink
     *       key={ key }
     *       sectionId={ data.sectionId }
     *     >
     *       {children}
     *     </SectionLink>
     *   );
     * },
     */
  },
};

/**
 * Renderer class for building raw-to-react rendering react component instances
 */
class Renderer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor ( props ) {
    super( props );
  }

  /**
   * Determines whether to update the component or not
   * @param {object} nextProps - the future properties of the component
   * @return {boolean} shouldUpdate - yes or no
   */
  shouldComponentUpdate( ) {
    return true;
    // return this.props.raw !== nextProps.raw;
  }

  /**
   * Displays something when no suitable content state is provided to the renderer
   * @return {ReactElement} default message
   */
  renderWarning() {
    return <div />;
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      raw,
    } = this.props;
    if ( !raw ) {
      return this.renderWarning();
    }
    const rendered = redraft( raw, renderers );
    // redraft can return a null if there's nothing to render
    if ( !rendered ) {
      return this.renderWarning();
    }
    return (
      <div className={ 'rendered-content' }>
        {rendered}
      </div>
    );
  }
}

/**
 * Component's properties types
 */
Renderer.propTypes = {

  /**
   * Draft-js raw representation of some contents
   * see https://draftjs.org/docs/api-reference-data-conversion.html
   */
  raw: PropTypes.object
};

export default Renderer;

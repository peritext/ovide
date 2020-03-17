/**
 * This module provides a card for displaying a resource in the section edition view
 * @module ovide/features/SectionView
 */
/* eslint react/no-set-state : 0 */
/* eslint react/no-danger : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import {
  Button,
  Card,
  Column,
  Columns,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

import { resourceHasContents } from 'peritext-utils';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  abbrevString,
  silentEvent
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import CenteredIcon from '../../../components/CenteredIcon';
import MovePad from '../../../components/MovePad';
import MoveButton from './MoveButton';

/**
 * Imports Assets
 */
import './ResourceMiniCard.scss';

/**
 * react-dnd drag & drop handlers
 */

/**
 * drag source handler
 */
const resourceSource = {
  beginDrag( props ) {
    return {
      id: props.sectionKey,
      index: props.sectionIndex
    };
  }
};

/**
 * dnd-related decorators for the ResourceCard component
 */
@DragSource( 'RESOURCE', resourceSource, ( connect, monitor ) => ( {
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
} ) )

/**
 * ResourceCard class for building react component instances
 */
class ResourceCard extends Component {

  /**
   * Component's context used properties
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: PropTypes.func.isRequired,
    setDraggedResourceId: PropTypes.func,
    // getResourceDataUrl: PropTypes.func
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props ) {
    super( props );
    this.state = {
      moved: undefined
    };
  }

  componentDidMount() {
    const {
      connectDragPreview,
      resource = {}
    } = this.props;
    const { metadata = {} } = resource;
    const { type = 'bib' } = metadata;
    const img = new Image();
    img.src = icons[type].black.svg;
    img.onload = () =>
      connectDragPreview( img );
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {

    /**
     * Variables definition
     */
    const {
      props,
      context: {
        t,
        setDraggedResourceId,
      }
    } = this;
    const {
      resource = {},
      isActive,
      onEdit,
      onDelete,
      getTitle,
      selectMode,
      tags = {},

      connectDragSource,
      onMouseDown,
      onGoToResource,
    } = props;

     const {
        data,
        metadata = {}
      } = resource;

      const {
        type,
      } = metadata;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.SectionView' );

    /**
     * Computed variables
     */

    let resourceTitle;
    if ( type === 'bib' && data && data[0] ) {
      resourceTitle = (
        <div
          data-for={ 'tooltip' }
          data-place={ 'right' }
          data-html
          data-tip={ data[0].htmlPreview }
          className={ 'bib-wrapper-mini' }
          dangerouslySetInnerHTML={ { __html: data[0].htmlPreview } }
        />
      );
    }
    else {
       resourceTitle = getTitle( resource ) || translate( 'untitled resource' );
    }
    resourceTitle = abbrevString( resourceTitle, 10 );

    const resourceTags = ( resource.metadata.tags || [] )
    .map( ( tagId ) => tags[tagId] ).filter( ( tag ) => tag );

    /**
     * Callbacks handlers
     */
    const handleMouseDown = ( e ) => {
      e.stopPropagation();
      if ( typeof onMouseDown === 'function' ) {
        onMouseDown();
      }
    };

    const handleDragStart = ( e ) => {
      if ( selectMode ) {
        return silentEvent( e );
      }
       this.setState( {
        moved: true
       } );
       const icon = new Image();
       icon.src = icons[type].black.svg;
       e.dataTransfer.setDragImage( icon, 0, 0 );
       e.dataTransfer.dropEffect = 'move';
       setDraggedResourceId( resource.id );
       // e.dataTransfer.setData('text', 'DRAFTJS_RESOURCE_ID:' + resource.id);
       e.dataTransfer.setData( 'text', ' ' );
    };

   const handleDragEnd = () => {
    this.setState( {
      moved: false
    } );
   };

   const handleDelete = ( event ) => {
    if ( event ) {
      event.stopPropagation();
    }
    onDelete( event );
   };

   const handleClick = ( e ) => {
    // onEdit( e );
    e.stopPropagation();
    onGoToResource( resource.id );
  };
    return connectDragSource(
      <div
        // draggable
        onDragStart={ handleDragStart }
        onDragEnd={ handleDragEnd }
        onMouseDown={ handleMouseDown }
        style={ { cursor: 'move' } }
      >
        <Card
          isActive={ isActive }
          bodyContent={
            <div onClick={ handleClick }>
              <Columns style={ {
                minHeight: '2.5em',
                maxHeight: '4em',
                overflow: 'hidden',
                marginBottom: 0,
              } }
              >
                <Column
                  isSize={ 2 }
                  style={ {
                    paddingTop: 0,
                    paddingBottom: 0
                  } }
                >
                  <CenteredIcon
                    src={ icons[type] && icons[type].black.svg }
                    data-tip={ translate( resource.metadata.type ) }
                    data-for={ 'tooltip' }
                    data-effect={ 'solid' }
                    isSize={ '32x32' }
                  />
                  {
                    resourceHasContents( resource ) ?
                      <span
                        className={ 'contents-indicator' }
                        data-for={ 'tooltip' }
                        data-tip={ translate( 'this resource is annotated with contents' ) }
                        style={ {
                          position: 'absolute',
                          left: '1.5rem',
                          top: '3rem',
                          minWidth: '1rem',
                          minHeight: '1rem',
                          display: 'flex',
                          flexFlow: 'column nowrap',
                          alignItems: 'stretch'
                        } }
                      >
                        ☰
                      </span>
                    : null
                  }
                  {
                    resourceTags && resourceTags.length ?
                      <div
                        style={ {
                          position: 'absolute',
                          left: '2rem',
                          top: '4.5rem',
                          minWidth: '1rem',
                          minHeight: '1rem',
                          display: 'flex',
                          flexFlow: 'column nowrap',
                          alignItems: 'stretch'
                        } }
                      >
                        {
                        resourceTags.map( ( tag ) => (
                          <div
                            key={ tag.id }
                            data-for={ 'tooltip' }
                            data-tip={ translate( 'this material has tag {name}', { name: tag.name } ) }
                            style={ {
                              flex: 1,
                              background: tag.color
                            } }
                          />
                        ) )
                      }
                      </div>
                    : null
                  }
                  {/*<Icon
                    data-tip={ translate( resource.metadata.type ) }
                    data-for={ 'tooltip' }
                    isSize={ 'medium' }
                    data-effect={ 'solid' }
                    isAlign={ 'left' }
                  >
                    <img src={ icons[type].black.svg } />
                  </Icon>*/}
                </Column>

                <Column
                  isSize={ 8 }
                  style={ {
                    paddingTop: '.2rem',
                    paddingBottom: 0
                  } }
                >
                  <span
                    data-html
                    data-place={ 'bottom' }
                    data-tip={ resource.metadata.title }
                    data-for={ 'tooltip' }
                  >
                    {resourceTitle}
                  </span>
                </Column>

              </Columns>
              <Columns>
                <Column
                  style={ { paddingTop: '.5rem' } }
                  isOffset={ 2 }
                  isSize={ 7 }
                >
                  <Button
                    onClick={ onEdit }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( 'settings' ) }
                  >
                    <CenteredIcon src={ icons.settings.black.svg } />

                  </Button>

                  <Button
                    onClick={ handleClick }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( 'edit resource contents' ) }
                  >
                    <CenteredIcon src={ icons.edit.black.svg } />
                  </Button>

                  <Button
                    onClick={ handleDelete }
                    isDisabled={ isActive }
                    data-place={ 'left' }
                    data-effect={ 'solid' }
                    data-for={ 'tooltip' }
                    data-tip={ translate( `delete this ${type}` ) }
                  >
                    <CenteredIcon src={ icons.remove.black.svg } />
                  </Button>
                </Column>
                <Column
                  style={ { position: 'relative' } }
                  isSize={ 2 }
                >
                  <MovePad
                    style={ {
                      position: 'absolute',
                      top: '-3rem',
                      right: '4rem',
                      pointerEvents: 'none'
                    } }
                    moveComponentToolTip={ translate( 'Drag this item to the editor' ) }
                    MoveComponent={ MoveButton }
                  />
                </Column>
              </Columns>
            </div>
        }
        />
      </div>
    );
  }
}

export default ResourceCard;

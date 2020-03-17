/**
 * This module provides a section card for the summary view
 * @module ovide/features/SummaryView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { SortableHandle } from 'react-sortable-hoc';
import { Link } from 'react-router-dom';

import {
  Button,
  Card,
  Icon,
  Columns,
  Column,
  Tag,
  Title,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { silentEvent } from '../../../helpers/misc';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  abbrevString,
  computeSectionFirstWords,
  getColorByBgColor
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import MovePad from '../../../components/MovePad';
import CenteredIcon from '../../../components/CenteredIcon';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared variables
 */
const MAX_TITLE_LEN = 30;

const SectionCard = ( {
  section,
  level,
  goTo,
  setSectionLevel,
  sectionIndex,
  maxSectionIndex,
  // minified,
  onToggleSelected,
  production,
  onDelete,
  setSectionIndex,
  showMoveUi,
  isActive,
  tags,
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Components.SectionCard' );

  /**
   * Computed variables
   */

  const sectionTitle = (
    <span
      data-for={ 'card-tooltip' }
      data-place={ 'right' }
      data-html
      data-tip={ `<div class="content"><h5 style="color: white">${section.metadata.title}</h5><p>${computeSectionFirstWords( section )}</p></div>` }
    >
      {abbrevString( section.metadata.title || translate( 'Untitled section' ), MAX_TITLE_LEN )}
    </span>
  );

  const titleSize = 5;

  /**
   * Callbacks handlers
   */
  const handleAction = ( action, event ) => {
    event.stopPropagation();
    switch ( action ) {
      case 'delete':
        onDelete( section.id );
        break;
      case 'higher':
        setSectionLevel( { resourceId: section.id, level: level - 1 } );
        break;
      case 'lower':
        setSectionLevel( { resourceId: section.id, level: level + 1 } );
        break;
      case 'edit':
      default:
        goTo( section.id );
        break;

    }
  };

  const handleClick = ( e ) => {
    e.stopPropagation();
    // goTo( section.id );
    onToggleSelected( section.id );
  };
  const handleEdit = ( e ) => {
    handleAction( 'edit', e );
  };
  const handleDelete = ( e ) => {
    handleAction( 'delete', e );
  };

  return (
    <div
      className={ 'is-clickable' }
      onClick={ handleClick }
    >
      <Card
        onAction={ handleAction }
        isActive={ isActive }
        bodyContent={
          <div>
            <Columns style={ { marginBottom: 0 } }>
              <Column
                style={ { paddingBottom: 0 } }
                isSize={ 1 }
              >
                <CenteredIcon
                  src={ icons.section.black.svg }
                  isSize={ '32x32' }
                />
              </Column>

              <Column
                style={ { paddingBottom: 0 } }
                isSize={ showMoveUi ? 7 : 5 }
              >
                <Title isSize={ titleSize }>
                  {
                    isActive ?
                    sectionTitle :
                    <Link
                      to={ `/productions/${production.id}/sections/${section.id}` }
                      data-tip={ section.metadata.title.length > MAX_TITLE_LEN ? section.metadata.title : undefined }
                      data-for={ 'card-tooltip' }
                      data-place={ 'bottom' }
                    >
                      <span>
                        {sectionTitle}
                      </span>
                    </Link>
                  }

                </Title>
                {
                  section.metadata.tags && section.metadata.tags.length ?
                    <div style={ { fontSize: '.6rem' } }>
                      {
                      section.metadata.tags.map( ( tagId ) => {
                        const tag = tags[tagId];
                        if ( tag ) {
                          return (
                            <Tag
                              style={ {
                                background: tag.color,
                                color: getColorByBgColor( tag.color )
                              } }
                              key={ tagId }
                            >
                              {tag.name}
                            </Tag>
                          );
                        }
                        return null;

                      } )
                    }
                    </div>
                  :
                  null
                }
                {
                  !showMoveUi &&
                  <div style={ { marginTop: '1rem' } }>
                    <Button
                      onClick={ handleEdit }
                      data-effect={ 'solid' }
                      data-place={ 'left' }
                      data-for={ 'card-tooltip' }
                      data-tip={ translate( 'edit section' ) }
                    >
                      <CenteredIcon src={ icons.edit.black.svg } />
                    </Button>
                    <Button
                      onClick={ handleDelete }
                      data-effect={ 'solid' }
                      data-place={ 'left' }
                      data-for={ 'card-tooltip' }
                      data-tip={ translate( 'delete this section' ) }
                    >
                      <CenteredIcon src={ icons.remove.black.svg } />
                    </Button>
                  </div>
                }
              </Column>
              {
                !showMoveUi &&
                <Column isSize={ 6 }>
                  <p style={ { fontSize: '.8rem' } }>
                    <i>{computeSectionFirstWords( section )}</i>
                  </p>
                  {
                  section.lastUpdateAt &&
                  <div style={ { paddingTop: '.5rem', fontSize: '.6rem' } }>
                    <i>{translate( 'Last update:' )} {new Date( section.lastUpdateAt ).toLocaleString()}</i>
                  </div>
                }

                </Column>
              }
            </Columns>
            {showMoveUi &&
            <Columns>
              <Column
                isOffset={ 1 }
                isSize={ showMoveUi ? 7 : 6 }
                style={ {

                  /*
                   * paddingTop: 0,
                   * paddingBottom: 0
                   */
                } }
              >
                <i>{computeSectionFirstWords( section )}</i>
                {
                  section.lastUpdateAt &&
                  <div style={ { paddingTop: '.5rem', fontSize: '.6rem' } }>
                    <i>{translate( 'Last update:' )} {new Date( section.lastUpdateAt ).toLocaleString()}</i>
                  </div>
                }
                <div style={ { marginTop: '1rem' } }>
                  <Button
                    onClick={ handleEdit }
                    data-effect={ 'solid' }
                    data-place={ 'left' }
                    data-for={ 'card-tooltip' }
                    data-tip={ translate( 'edit section' ) }
                  >
                    <CenteredIcon src={ icons.edit.black.svg } />
                  </Button>
                  <Button
                    onClick={ handleDelete }
                    data-effect={ 'solid' }
                    data-place={ 'left' }
                    data-for={ 'card-tooltip' }
                    data-tip={ translate( 'delete this section' ) }
                  >
                    <CenteredIcon src={ icons.remove.black.svg } />
                  </Button>
                </div>
              </Column>
              <Column
                style={ {
                  // paddingTop: 0,
                  position: 'relative'
                } }
                isSize={ showMoveUi ? 2 : 6 }
              >
                <MovePad
                  style={ {
                        position: 'absolute',
                        top: 0,
                        right: '1rem'
                      } }
                  chevronsData={ {
                        left: {
                          tooltip: translate( 'Title level {n}', { n: level } ),
                          isDisabled: level === 0,
                          onClick: () => setSectionLevel( { sectionId: section.id, level: level - 1 } )
                        },
                        right: {
                          tooltip: translate( 'Title level {n}', { n: level + 2 } ),
                          isDisabled: level >= config.maxSectionLevel - 1,
                          onClick: () => setSectionLevel( { sectionId: section.id, level: level + 1 } )
                        },
                        up: {
                          isDisabled: sectionIndex === 0,
                          tooltip: translate( 'Move up in the summary' ),
                          onClick: () => setSectionIndex( sectionIndex, sectionIndex - 1 )
                        },
                        down: {
                          isDisabled: sectionIndex === maxSectionIndex,
                          tooltip: translate( 'Move down in the summary' ),
                          onClick: () => setSectionIndex( sectionIndex, sectionIndex + 1 )
                        }
                      } }
                  moveComponentToolTip={ translate( 'Move section in summary' ) }
                  MoveComponent={ SortableHandle( () =>
                        (
                          <span
                            onClick={ silentEvent }
                            onMouseUp={ silentEvent }
                            style={ { cursor: 'move' } }
                            className={ 'button' }
                          >
                            <Icon className={ 'fa fa-arrows-alt' } />
                          </span>
                        )
                      ) }
                />

              </Column>
            </Columns>}
          </div>
                    }
      />
    </div>
  );
};

SectionCard.contextTypes = {
  t: PropTypes.func
};

export default SectionCard;

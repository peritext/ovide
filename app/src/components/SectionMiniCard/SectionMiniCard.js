/**
 * This module provides a card for representing a section in the section edition view
 * @module ovide/features/SectionView
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
  Column,
  Columns,
  Icon,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import { getResourceTitle } from 'peritext-utils';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import {
  abbrevString,
  computeSectionFirstWords,
  silentEvent
} from '../../helpers/misc';

/**
 * Imports Components
 */
import MovePad from '../MovePad';
import CenteredIcon from '../CenteredIcon';

/**
 * Imports Assets
 */
import config from '../../config';

const SectionMiniCard = ( {
  cardStyle = {},
  isActive,
  section,
  tags = {},
  level = 0,
  productionId,
  onDeleteSection,
  onOpenSettings,
  setSectionLevel,
  disableMove,

  setSectionIndex,
  sectionIndex,
  maxSectionIndex,
  allowMove,
  onSelect,
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );

  /**
   * Computed variables
   */
  const title = getResourceTitle( section );
  const sectionTitle = (
    <span
      data-for={ 'tooltip' }
      data-place={ 'right' }
      data-html
      data-tip={ `<div class="content"><h5 style="color: white">${title}</h5><p>${computeSectionFirstWords( section )}</p></div>` }
    >
      {abbrevString( title || translate( 'Untitled section' ), 25 )}
    </span>
  );
  const sectionTags = ( section.metadata.tags || [] )
  .map( ( tagId ) => tags[tagId] ).filter( ( tag ) => tag );

  return (
    <Card
      isActive={ isActive }
      bodyContent={
        <div
          style={ { cursor: isActive ? undefined : 'pointer' } }
          onClick={ onSelect }
        >
          <Columns style={ { marginBottom: 0 } }>
            <Column
              isSize={ 2 }
              style={ {
                paddingTop: 0,
                paddingBottom: 0
              } }
            >
              <CenteredIcon
                src={ icons.section.black.svg }
                isSize={ '32x32' }
              />
            </Column>

            {
              sectionTags && sectionTags.length ?
                <div
                  style={ {
                  position: 'absolute',
                  left: '2rem',
                  top: '5rem',
                  minWidth: '1rem',
                  minHeight: '1rem',
                  display: 'flex',
                  flexFlow: 'column nowrap',
                  alignItems: 'stretch'
                } }
                >
                  {
                  sectionTags.map( ( tag ) => (
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
            <Column
              isSize={ 8 }
              style={ {
                paddingTop: 0,
                paddingBottom: 0
              } }
            >
              {
                history && !isActive ?
                  <Link
                    style={ cardStyle }
                    to={ `/productions/${productionId}/sections/${section.id}` }
                  >
                    {sectionTitle}
                  </Link>
                :
                  <b>{sectionTitle}</b>
              }
            </Column>
          </Columns>
          <Columns>
            <Column
              style={ { marginTop: '.5rem' } }
              isOffset={ 2 }
              isSize={ 7 }
            >
              {onOpenSettings
                &&
                <Button
                  onClick={ onOpenSettings }
                  data-effect={ 'solid' }
                  data-place={ 'left' }
                  data-for={ 'tooltip' }
                  data-tip={ translate( 'section settings' ) }
                >
                  <CenteredIcon src={ icons.settings.black.svg } />
                </Button>
              }
              <Button
                onClick={ onDeleteSection }
                isDisabled={ isActive }
                data-effect={ 'solid' }
                data-place={ 'left' }
                data-for={ 'tooltip' }
                data-tip={ translate( 'delete this section' ) }
              >
                <CenteredIcon src={ icons.remove.black.svg } />
              </Button>
            </Column>

            <Column
              style={ { position: 'relative' } }
              isSize={ 2 }
            >
              {
                allowMove &&
                <MovePad
                  style={ {
                    position: 'absolute',
                        top: '-2.5rem',
                        right: '5rem',
                  } }
                  chevronsData={ {
                    left: {
                      tooltip: translate( 'Title level {n}', { n: level } ),
                      isDisabled: level === 0,
                      onClick: ( e ) => {
                        e.stopPropagation();
                        setSectionLevel( { sectionId: section.id, level: level - 1 } );
                      }
                    },
                    right: {
                      tooltip: translate( 'Title level {n}', { n: level + 2 } ),
                      isDisabled: level >= config.maxSectionLevel - 1,
                      onClick: ( e ) => {
                        e.stopPropagation();
                        setSectionLevel( { sectionId: section.id, level: level + 1 } );
                      }
                    },
                    up: {
                      isDisabled: sectionIndex === 0,
                      tooltip: translate( 'Move up in the summary' ),
                      onClick: ( e ) => {
                        e.stopPropagation();
                        setSectionIndex( sectionIndex, sectionIndex - 1 );
                      }
                    },
                    down: {
                      isDisabled: sectionIndex === maxSectionIndex,
                      tooltip: translate( 'Move down in the summary' ),
                      onClick: ( e ) => {
                        e.stopPropagation();
                        setSectionIndex( sectionIndex, sectionIndex + 1 );
                      }
                    }
                  } }
                  moveComponentToolTip={ translate( 'Move section in summary' ) }
                  hideMainButton={ disableMove }
                  MoveComponent={ SortableHandle( () =>
                    (
                      <span
                        onClick={ silentEvent }
                        onMouseUp={ silentEvent }
                        onMouseDown={ silentEvent }
                        style={ { cursor: 'move' } }
                        className={ 'button' }
                      >
                        <Icon className={ 'fa fa-arrows-alt' } />
                      </span>
                    )
                  ) }
                />
              }

            </Column>

          </Columns>
        </div>
    }
    />
  );
};

SectionMiniCard.contextTypes = {
  t: PropTypes.func,
};

export default SectionMiniCard;

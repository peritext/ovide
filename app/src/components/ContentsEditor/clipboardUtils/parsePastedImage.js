/**
 * This module provides the logic for handling an image pasting
 * @module ovide/components/ContentsEditor
 */
import { v4 as generateId } from 'uuid';

import { createDefaultResource } from '../../../helpers/schemaUtils';

import {
  constants,
} from 'scholar-draft';

const {
  BLOCK_ASSET,
} = constants;

export default (
  node,
  activeSectionId,
) => {

  const url = node.getAttribute( 'src' );
  let title = node.getAttribute( 'title' );
  const alt = node.getAttribute( 'alt' );
  if ( !title || !alt || alt === 'href' ) {
    title = url;
  }
  if ( !url || url.indexOf( 'http' ) !== 0 ) {
    return {};
  }

  const resourceId = generateId();
  const ext = url.split( '.' ).pop().split( '?' )[0];
  const resource = {
    ...createDefaultResource(),
    id: resourceId,
    metadata: {
      type: 'image',
      createdAt: new Date().getTime(),
      lastModifiedAt: new Date().getTime(),
      ext,
      mimetype: `image/${ext}`,
      title,
    },
    data: {
      images: [], // @todo fill
    }
  };
  const contextualizerId = generateId();
  const contextualizationId = generateId();
  const contextualizer = {
    id: contextualizerId,
    type: 'image',
    insertionType: 'block'
  };
  const contextualization = {
    id: contextualizationId,
    contextualizerId,
    sourceId: resourceId,
    targetId: activeSectionId,
    type: 'image',
  };

  const entity = {
    type: BLOCK_ASSET,
    mutability: 'IMMUTABLE',
    data: {
      asset: {
        id: contextualizationId
      }
    }
  };

  return {
    resource,
    contextualizer,
    contextualization,
    entity,
  };
};

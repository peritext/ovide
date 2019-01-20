/**
 * This module provides a component for previewing an asset document attached file
 * with the right html representation.
 * @module ovide/components/PrimitiveAssetPreview
 */

import React from 'react';
// import PropTypes from 'prop-types';

// import MediaPlayer from 'react-player';
import Table from 'react-table';

import 'react-table/react-table.css';

import './PrimitiveAssetPreview.scss';

const render = ( asset ) => {

  /*
   * const attachmentName = asset.filename;
   * const assetUrl = asset.address ?
   *       asset.protocol + '://' + asset.address
   *   : `file://${getContentPath()}/${productionId}/assets/${asset.id}/${asset.filename}`;
   */
  switch ( asset.mimetype ) {

    /*
     * case 'application/pdf':
     * case 'text/markdown':
     *   return <iframe src={assetUrl} />;
     */

    case 'image/png':
    case 'image/jpg':
    case 'image/jpeg':
    case 'image/gif':
    case 'image/svg+xml':
      return <img src={ asset.data } />;

    /*
     * case 'video/mp4':
     * case 'video/x-msvideo':
     * case 'video/mpeg':
     * case 'video/ogg':
     * case 'video/webm':
     * case 'video/3gp':
     * case 'audio/mpeg':
     * case 'audio/mp3':
     * case 'video/quicktime':
     * case 'audio/mp4':
     *   return (
     *     <Media>
     *         <div className="media-player-wrapper">
     *           <MediaPlayer url={assetUrl} />
     *         </div>
     *     </Media>
     *   );
     */

      case 'text/csv':
      case 'text/tsv':
      case 'text/comma-separated-values':
      case 'text/tab-separated-values':
      const data = asset.data || [];
      const first = data.length ? data[0] : {};
        const columns = Object.keys( first )
        .filter( ( key ) => key.trim().length )
        .map( ( key ) => ( {
          Header: key,
          accessor: key
        } ) );
        return (
          <Table
            data={ data }
            columns={ columns }
            {
              ...{
                showPagination: false,
                showPageSizeOptions: false,
                defaultPageSize: 5,
                sortable: false,
                filterable: false,
              }
            }
          />
        );

    default:
      return (
        <div>
          No preview available {asset.mimetype}
        </div>
      );
  }
};

const AssetPreview = ( {
  asset,
  // productionId
}, {

  /*
   * t,
   * getContentPath,
   */
} ) => {
  if ( asset ) {
    return (
      <div className={ 'ovide-PrimitiveAssetPreview' }>
        {render( asset )}
      </div>
    );
  }
  return null;
};

/*
 * AssetPreview.contextTypes = {
 *   getContentPath: PropTypes.func,
 *   // t: PropTypes.func.isRequired,
 * };
 */

export default AssetPreview;

/**
 * This module provides a component for previewing an asset document attached file
 * with the right html representation.
 * @module ovide/components/PrimitiveAssetPreview
 */

/*
 * import React from 'react';
 * import PropTypes from 'prop-types';
 */

// import MediaPlayer from 'react-player';

// import 'react-table/react-table.css';

// import './PrimitiveAssetPreview.scss';

/*
 * const render = (asset, getContentPath, productionId) => {
 *   const attachmentName = asset.filename;
 *   const assetUrl = asset.address ?
 *         asset.protocol + '://' + asset.address
 *     : `file://${getContentPath()}/${productionId}/assets/${asset.id}/${asset.filename}`;
 *   switch (asset.mimetype) {
 *     case 'application/pdf':
 *     case 'text/markdown':
 *       return <iframe src={assetUrl} />;
 */

/*
 *     case 'image/png':
 *     case 'image/jpg':
 *     case 'image/jpeg':
 *     case 'image/gif':
 *     case 'image/svg+xml':
 *       return <img src={assetUrl} />;
 */

/*
 *     case 'video/mp4':
 *     case 'video/x-msvideo':
 *     case 'video/mpeg':
 *     case 'video/ogg':
 *     case 'video/webm':
 *     case 'video/3gp':
 *     case 'audio/mpeg':
 *     case 'audio/mp3':
 *     case 'video/quicktime':
 *     case 'audio/mp4':
 *       return (
 *         <Media>
 *             <div className="media-player-wrapper">
 *               <MediaPlayer url={assetUrl} />
 *             </div>
 *         </Media>
 *       );
 */

/*
 *     case 'text/csv':
 *     case 'text/tsv':
 *       return <div>Should render a table picking in asset url {assetUrl}</div>
 *       // return (
 *       //   <Table
 *       //     src={assetUrl} />
 *       // );
 */

/*
 *     default:
 *       return (
 *         <div>
 *           No preview available {asset.mimetype}
 *         </div>
 *       );
 *   }
 * };
 */

/*
 * const AssetPreview = ({
 *   asset,
 *   productionId
 * }, {
 *   // t,
 *   getContentPath,
 * }) => {
 *   if (asset) {
 *     return (
 *       <div className="ovide-PrimitiveAssetPreview">
 *         {render(asset, getContentPath, productionId)}
 *       </div>
 *     );
 *   }
 *   return null;
 * };
 */

/*
 * AssetPreview.contextTypes = {
 *   getContentPath: PropTypes.func,
 *   // t: PropTypes.func.isRequired,
 * };
 */

// export default AssetPreview;

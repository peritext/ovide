
module.exports = ( socket, routes ) => {
  Object.keys( routes ).forEach( ( route ) => {
    socket.on( `message:${route}`, ( msg ) => {
      const handler = routes[route];
      const requestData = msg.data();
      if ( handler ) {
        handler( requestData )
          .then( ( data ) => {
            msg.reply( data );
          } )
          .catch( ( error ) => msg.reply( error ) );
      }
      else {
        msg.reply( new Error() );
      }
    } );
  } );
};

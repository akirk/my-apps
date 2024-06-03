jQuery( document ).ready( function( $ ) {
	$( '.move-up' ).on( 'click', function( e ) {
		e.preventDefault();
		var $this = $( this );
		var $row = $this.closest( 'tr' );
		if ( ! $row.prev().length ) {
			return;
		}
		$row.prev().before( $row );
	} );
	$( '.move-down' ).on( 'click', function( e ) {
		e.preventDefault();
		var $this = $( this );
		var $row = $this.closest( 'tr' );
		if ( ! $row.next().length ) {
			return;
		}
		$row.next().after( $row );
	} );
} );

jQuery( document ).ready( function( $ ) {
	$( '.move-up' ).on( 'click', function( e ) {
		e.preventDefault();
		const $this = $( this );
		const $row = $this.closest( 'tr' );
		if ( ! $row.prev().length ) {
			return;
		}
		$row.prev().before( $row );
	} );
	$( '.move-down' ).on( 'click', function( e ) {
		e.preventDefault();
		const $this = $( this );
		const $row = $this.closest( 'tr' );
		if ( ! $row.next().length ) {
			return;
		}
		$row.next().after( $row );
	} );

	$( '.delete-additional-app' ).on( 'click', function( e ) {
		e.preventDefault();
		const $this = $( this );
		$this.closest( 'tr' ).remove();
		$this.closest( 'form' ).submit();
	} );

	$( '.edit-additional-app' ).on( 'click', function( e ) {
		e.preventDefault();
		const $this = $( this );
		const $row = $this.closest( 'tr' );
		const $edit = $( '#edit-app' );
		const fields = [
			'input.my_app_name',
			'input.my_app_url',
			'input.my_app_icon_url',
			'.my_app_dashicon', // input hidden or select.
			'input.my_app_emoji',
		];
		for ( const field of fields ) {
			$edit.find( field ).val( $row.find( field ).val() );
		}

		$edit.find( 'input[name=icon_type]' ).attr( 'checked', false );
		if ( $edit.find( '.my_app_dashicon' ).val() ) {
			$edit.find( 'input[name=icon_type][value=dashicon]' ).attr( 'checked', true );
		} else if ( $edit.find( 'input.my_app_icon_url' ).val() ) {
			$edit.find( 'input[name=icon_type][value=icon]' ).attr( 'checked', true );
		} else if ( $edit.find( 'input.my_app_emoji' ).val() ) {
			$edit.find( 'input[name=icon_type][value=emoji]' ).attr( 'checked', true );
		}

		$row.remove();
	});
} );

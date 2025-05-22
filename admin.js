jQuery( document ).ready( function ( $ ) {
	const fields = [
		'input.my_app_id',
		'input.my_app_name',
		'input.my_app_url',
		'input.my_app_icon_url',
		'.my_app_dashicon', // input hidden or select.
		'input.my_app_emoji',
	];

	$( '.move-up' ).on( 'click', function ( e ) {
		e.preventDefault();
		const $this = $( this );
		const $row = $this.closest( 'tr' );
		if ( !$row.prev().length ) {
			return;
		}
		$row.prev().before( $row );
	} );
	$( '.move-down' ).on( 'click', function ( e ) {
		e.preventDefault();
		const $this = $( this );
		const $row = $this.closest( 'tr' );
		if ( !$row.next().length ) {
			return;
		}
		$row.next().after( $row );
	} );

	$( '.delete-additional-app' ).on( 'click', function ( e ) {
		e.preventDefault();
		const $this = $( this );
		$this.closest( 'tr' ).remove();
		$this.closest( 'form' ).submit();
	} );

	$( '.add-additional-app' ).on( 'click', function ( e ) {
		e.preventDefault();
		const $this = $( this );
		const $edit = $( '#edit-app' );
		$edit.show();
		for ( const field of fields ) {
			$edit.find( field ).val( '' );
		}
	} );
	$( '#edit-app input.my_app_icon_url, #edit-app input.my_app_emoji, #edit-app input.my_app_dashicon' ).on( 'keyup', function ( e ) {
		$( '#edit-app input[name=icon_type][value=icon]' ).attr( 'checked', e.target.classList.contains( 'my_app_icon_url' ) );
		$( '#edit-app input[name=icon_type][value=dashicon]' ).attr( 'checked', e.target.classList.contains( 'my_app_dashicon' ) );
		$( '#edit-app input[name=icon_type][value=emoji]' ).attr( 'checked', e.target.classList.contains( 'my_app_emoji' ) );
	} );


	$( '.edit-additional-app' ).on( 'click', function ( e ) {
		e.preventDefault();
		const $this = $( this );
		const $row = $this.closest( 'tr' );
		$row.siblings().show();
		const $edit = $( '#edit-app' );
		$edit.show();
		for ( const field of fields ) {
			$edit.find( field ).val( $row.find( field ).val() );
		}

		$edit.find( 'input[name=icon_type]' ).attr( 'checked', false );
		if ( $edit.find( 'input.my_app_dashicon' ).val() ) {
			$edit.find( 'input[name=icon_type][value=dashicon]' ).attr( 'checked', true );
		} else if ( $edit.find( 'input.my_app_icon_url' ).val() ) {
			$edit.find( 'input[name=icon_type][value=icon]' ).attr( 'checked', true );
		} else if ( $edit.find( 'input.my_app_emoji' ).val() ) {
			$edit.find( 'input[name=icon_type][value=emoji]' ).attr( 'checked', true );
		}

		$row.hide();
	} );
} );

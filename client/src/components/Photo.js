import React from 'react';

function Photo(props) {
  return (
    <img 
      src={props.image} 
      alt={props.imageAlt}
    />
  );
}

export default Photo;
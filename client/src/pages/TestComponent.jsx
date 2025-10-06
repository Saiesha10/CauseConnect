import React from 'react';
import { gql, useQuery } from '@apollo/client'; // useQuery is lowercase

const TEST_QUERY = gql`
  query TestQuery {
    ngos {
      id
      name
    }
  }
`;

const TestComponent = () => {
  const { loading, error, data } = useQuery(TEST_QUERY);

  console.log({ loading, error, data }); // Debug log

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.ngos.length === 0 ? (
        <li>No NGOs found</li>
      ) : (
        data.ngos.map((ngo) => (
          <li key={ngo.id}>{ngo.name}</li>
        ))
      )}
    </ul>
  );
};


export default TestComponent;

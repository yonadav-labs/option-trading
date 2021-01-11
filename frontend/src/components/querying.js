// https://stackoverflow.com/questions/40161516/how-do-you-programmatically-update-query-params-in-react-router
// function to add query to url
export const addQuery = (location, history, key, value) => {
    let pathname = location.pathname; 
    // returns path: '/app/books'
    let searchParams = new URLSearchParams(location.search); 
    // returns the existing query string: '?type=fiction&author=fahid'
    searchParams.set(key, value);
    history.push({
                pathname: pathname,
                search: searchParams.toString()
        });
};

export const removeQuery = (location, history, key) => {
    let pathname = location.pathname; 
   // returns path: '/app/books'
    let searchParams = new URLSearchParams(location.search); 
   // returns the existing query string: '?type=fiction&author=fahid'
    searchParams.delete(key);
    history.push({
             pathname: pathname,
             search: searchParams.toString()
       });
   };

export const useQuery = (location) => {
    return new URLSearchParams(location.search);
}

export const useSearch = (location, search) => {
    let query = new URLSearchParams(location.search);
    return query.get(search)
}
import React from 'react';

export default function withData(Component) {
  /**
   * @param {{
   *   fetch: Function,
   *   data: any,
   * }} props
   */
  return function (props) {
    const { fetch, data, ...rest} = props;
    const [needsFetch, setNeedsFetched] = React.useState(true);
    if (!data && needsFetch) {
      fetch();
      setNeedsFetched(false);
    }

    return <Component {...rest} data={data}/>
  }
}

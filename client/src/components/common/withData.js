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
    const [needsFetch, setNeedsFetched] = React.useState(data === null);
    if (needsFetch) {
      fetch();
      setNeedsFetched(false);
    }

    return <Component data={data} {...rest}/>
  }
}

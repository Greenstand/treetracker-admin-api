import React from 'react';

export default function withData(Component) {
  /**
   * @param {{
   *   fetch: Function,
   *   data: any,
   *   needsRefresh: boolean
   * }} props
   */
  return function (props) {
    const { fetch, data, needsRefresh, ...rest} = props;

    React.useEffect(() => {fetch(); return;}, [needsRefresh]);

    return <Component data={data} {...rest}/>
  }
}

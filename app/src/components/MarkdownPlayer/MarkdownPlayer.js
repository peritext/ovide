import CommonMark from 'commonmark';
import MarkdownRenderer from 'commonmark-react-renderer';

const parser = new CommonMark.Parser();
const md = new MarkdownRenderer();

export default ( { src } ) => md.render( parser.parse( src || '' ) );

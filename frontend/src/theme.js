import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import SvgIcon from "@material-ui/core/SvgIcon"

let theme = createMuiTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#ff8f2b',
        },
        secondary: {
            main: '#ffd338',
        },
        warning: {
            main: '#9B51E0',
        },
        divider: '#e4e4e4',
    },
    typography: {
        h1: {
            fontSize: '4.375rem',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.063em',
        },
        h2: {
            fontWeight: 400,
            letterSpacing: '-0.063em',
            lineHeight: 1.1,
        },
        h3: {
            fontSize: '2.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.063em',
        },
        h4: {
            fontSize: '1.75rem',
            lineHeight: 1.1,
        },
        h5: {
            fontWeight: 700,
            fontSize: '1.313rem',
            lineHeight: 1.2,
        },
        h6: {
            fontWeight: 700,
            fontSize: '1.125rem',
            lineHeight: 1.2,
        },
        subtitle1: {
            fontSize: '0.875rem',
            lineHeight: 1.2,
            fontWeight: 500,
        },
        // subtitle2: undefined,
        // body1: undefined,
        // body2: undefined,
        title: {
            fontFamily: "Roboto",
            fontWeight: 500,
            fontSize: '1rem',
            lineHeight: 1.4,
        },
        paragraph: {
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: 1.4,
        },
        smallParagraph: {
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.2,
        },
        label: {
            fontFamily: "Roboto",
            fontWeight: 700,
            fontSize: '0.75rem',
            lineHeight: 1.3,
            letterSpacing: '0.063em',
            textTransform: 'uppercase'
        },
        button: {
            fontFamily: "Roboto",
            fontWeight: 700,
            fontSize: '0.75rem',
            lineHeight: 1.3,
            letterSpacing: '0.063em',
            textTransform: 'uppercase'
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(90deg, #FF8F2B 0%, #FFD43A 100%)',
                    border: 0,
                    boxShadow: 'none',
                    color: '#fafafa',
                    height: 40,
                    padding: '14px 22px 13px',
                    transition: 'ease-in-out',
                    WebkitTransition: 'ease-in-out',
                    '&:disabled': {
                        color: '#fafafa',
                        opacity: 0.5,
                    },
                    // "&:focus": {
                    //     boxSizing: 'border-box',
                    //     border: '1px solid #333333'
                    // },
                    '&:hover': {
                        background: '#ff8f2b',
                        boxShadow: 'none',
                    }
                },
            },
            variants: [
                {
                    props: { variant: 'secondary' },
                    style: {
                        background: '#fafafa',
                        boxShadow: 'none',
                        color: '#333333',
                        height: 40,
                        padding: '14px 22px 13px',
                        transition: 'ease-in-out',
                        WebkitTransition: 'ease-in-out',
                        '&:disabled': {
                            borderColor: 'linear-gradient(90deg, #FF8F2B 0%, #FFD43A 100%)',
                            border: '1px',
                            color: '#333333',
                            opacity: 0.5
                        },
                        // "&:focus": {
                        //     boxSizing: 'border-box',
                        //     border: '1px solid #333333'
                        // },
                        '&:hover': {
                            background: '#fafafa',
                            color: '#ff8f2b',
                            boxShadow: 'none',
                        }
                    }
                }
            ]
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    opacity: 1,
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                icon: {
                    color: '#ff8f2b'
                }
            },
            defaultProps: {
                IconComponent: ExpandMoreIcon
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                popupIndicator: {
                    '& span': {
                        '& svg': {
                            color: '#ff8f2b',
                            '& path': {
                                d: 'path("M 16.59 8.59 L 12 13.17 L 7.41 8.59 L 6 10 l 6 6 l 6 -6 Z")'
                            }
                        }
                    }
                }
            }
        },
        MuiPaginationItem: {
            variants: [
                {
                    props: { variant: 'text' }
                }
            ]
        }
    },
    shape: {
        borderRadius: 5,
    },
});

theme = responsiveFontSizes(theme);
theme.typography.subtitle2 = undefined;
// theme.typography.body1 = undefined;
theme.typography.body2 = undefined;

export default theme
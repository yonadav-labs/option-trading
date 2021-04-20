import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"

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
            fontSize: '5rem',
            fontWeight: 'normal',
            lineHeight: 1,
            letterSpacing: '-0.071em',
        },
        h2: {
            fontSize: '4.286rem',
            fontWeight: 'normal',
            lineHeight: 1.1,
            letterSpacing: '-0.071em',
        },
        h3: {
            fontSize: '2.857rem',
            fontWeight: 'normal',
            lineHeight: 1.2,
            letterSpacing: '-0.071em',
        },
        h4: {
            fontSize: '2rem',
            fontWeight: 'normal',
            lineHeight: 1.1,
        },
        h5: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
        },
        h6: {
            fontSize: '1.286rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
        },
        subtitle1: {
            fontSize: '1.143rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        subtitle2: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1.143rem',
            fontWeight: 'normal',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '1rem',
            fontWeight: 'normal',
            lineHeight: 1.5,
        },
        button: {
            fontFamily: "Roboto",
            fontSize: '0.786rem',
            fontWeight: 'bold',
            lineHeight: 1.3,
            letterSpacing: '0.071em',
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

export default theme
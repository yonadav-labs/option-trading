import React from "react";
import { Card, CardContent, Grid, Typography } from "@material-ui/core";
import StarRateIcon from '@material-ui/icons/StarRate';
import colors from "../../colors";

export default function TestimonialCard(props) {
    const { testimonialRating, testimonialMsg, testimonialAuthor } = props;

    const getRating = (testimonialRating) => {
        let rating = [];
        for (let i = 0; i < testimonialRating; i++) {
            rating.push(<StarRateIcon style={{ color: colors.orange }} />);
        }
        return rating;
    };

    return (
        <Card sx={{ p: 3, borderRadius: 4, boxShadow: 4, width: "350px", height: "325px" }}>
            <CardContent sx={{ minHeight: 239 }}>
                <Grid container justifyContent="center" alignItems="center">
                    {getRating(testimonialRating)}
                    <br />
                    <Typography variant="body2" textAlign="center" py={2}>
                        {testimonialMsg}
                    </Typography>
                    <br />
                    <Typography variant="subtitle2" textAlign="center" py={2}>{testimonialAuthor}</Typography>
                </Grid>
            </CardContent>
        </Card>
    )
}
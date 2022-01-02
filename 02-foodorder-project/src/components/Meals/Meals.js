import MealsSummary from "./MealsSummary";
import AvailbleMeals from "./AvailableMeals";
import {Fragment} from 'react'

const Meals = () => {
    return <Fragment>
        <MealsSummary/>
        <AvailbleMeals/>
    </Fragment>
}

export default Meals;
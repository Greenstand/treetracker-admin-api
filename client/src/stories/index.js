import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import IconLogo		from '../components/IconLogo.js';

storiesOf('Welcome', module)
	.add('Greenstand logo', 
		() => <IconLogo/>
	);

import WidgetBase from '@dojo/framework/widget-core/WidgetBase';
import { tsx } from '@dojo/framework/widget-core/tsx';
import Outlet from '@dojo/framework/routing/Outlet';

import Header from './widgets/Header';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Examples from './pages/Examples';
import Playground from './pages/Playground';
import Community from './pages/Community';
import Tutorials from './pages/tutorials/Tutorials';
import TutorialsLanding from './pages/TutorialsLanding';
import ReferenceGuides from './pages/reference-guides/ReferenceGuides';
import ReferenceGuidesLanding from './pages/ReferenceGuidesLanding';

import * as css from './App.m.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons/faCloudDownloadAlt';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons/faGraduationCap';
import { faListAlt } from '@fortawesome/free-solid-svg-icons/faListAlt';
import { faAppleAlt } from '@fortawesome/free-solid-svg-icons/faAppleAlt';
import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons/faCodeBranch';
import { faPlug } from '@fortawesome/free-solid-svg-icons/faPlug';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { faLaptopCode } from '@fortawesome/free-solid-svg-icons/faLaptopCode';

library.add(
	faCloudDownloadAlt,
	faGraduationCap,
	faListAlt,
	faAppleAlt,
	faGlobe,
	faCodeBranch,
	faPlug,
	faUsers,
	faLaptopCode
);

export default class App extends WidgetBase {
	protected render() {
		return (
			<div classes={[css.root]}>
				<Header />
				<div classes={[css.content]}>
					<Outlet key="home" id="home" renderer={() => <Home />} />
					<Outlet key="blog" id="blog" renderer={() => <Blog />} />
					<Outlet key="examples" id="examples" renderer={() => <Examples />} />
					<Outlet key="playground" id="playground" renderer={() => <Playground />} />
					<Outlet key="community" id="community" renderer={() => <Community />} />
					<Outlet key="tutorials" id="tutorials" renderer={() => <TutorialsLanding />} />
					<Tutorials />
					<Outlet key="reference-guides" id="reference-guides" renderer={() => <ReferenceGuidesLanding />} />
					<ReferenceGuides />
				</div>
			</div>
		);
	}
}

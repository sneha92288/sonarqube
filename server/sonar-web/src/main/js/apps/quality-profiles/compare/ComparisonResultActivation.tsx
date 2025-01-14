/*
 * SonarQube
 * Copyright (C) 2009-2021 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import { Profile } from '../../../api/quality-profiles';
import { getRuleDetails } from '../../../api/rules';
import { Button } from '../../../components/controls/buttons';
import { lazyLoadComponent } from '../../../components/lazyLoadComponent';
import DeferredSpinner from '../../../components/ui/DeferredSpinner';
import { translate } from '../../../helpers/l10n';
import { RuleDetails } from '../../../types/types';

const ActivationFormModal = lazyLoadComponent(
  () => import('../../coding-rules/components/ActivationFormModal'),
  'ActivationFormModal'
);

interface Props {
  onDone: () => Promise<void>;
  profile: Profile;
  ruleKey: string;
}

interface State {
  rule?: RuleDetails;
  state: 'closed' | 'opening' | 'open';
}

export default class ComparisonResultActivation extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { state: 'closed' };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleButtonClick = () => {
    this.setState({ state: 'opening' });
    getRuleDetails({ key: this.props.ruleKey }).then(
      ({ rule }) => {
        if (this.mounted) {
          this.setState({ rule, state: 'open' });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ state: 'closed' });
        }
      }
    );
  };

  handleCloseModal = () => {
    this.setState({ state: 'closed' });
  };

  isOpen(state: State): state is { state: 'open'; rule: RuleDetails } {
    return state.state === 'open';
  }

  render() {
    const { profile } = this.props;

    const canActivate = !profile.isBuiltIn && profile.actions && profile.actions.edit;
    if (!canActivate) {
      return null;
    }

    return (
      <DeferredSpinner loading={this.state.state === 'opening'}>
        <Button disabled={this.state.state !== 'closed'} onClick={this.handleButtonClick}>
          {this.props.children}
        </Button>

        {this.isOpen(this.state) && (
          <ActivationFormModal
            modalHeader={translate('coding_rules.activate_in_quality_profile')}
            onClose={this.handleCloseModal}
            onDone={this.props.onDone}
            profiles={[profile]}
            rule={this.state.rule}
          />
        )}
      </DeferredSpinner>
    );
  }
}

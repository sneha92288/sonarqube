/*
 * SonarQube
 * Copyright (C) 2009-2019 SonarSource SA
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
package org.sonar.db.qualityprofile;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.sonar.db.Dao;
import org.sonar.db.DbSession;

import static org.sonar.db.DatabaseUtils.executeLargeInputs;

public class QualityProfileExportDao implements Dao {

  public List<ExportRuleDto> selectRulesByProfile(DbSession dbSession, QProfileDto profile) {
    List<ExportRuleDto> exportRules = mapper(dbSession).selectByProfileUuid(profile.getKee());

    Map<Integer, ExportRuleDto> exportRulesById = exportRules.stream().collect(Collectors.toMap(ExportRuleDto::getActiveRuleId, x -> x));
    Map<Integer, List<ExportRuleParamDto>> rulesParams = selectParamsByActiveRuleIds(dbSession, exportRulesById.keySet());

    rulesParams.forEach((id, rules) -> exportRulesById.get(id).setParams(rules));
    return exportRules;
  }

  private static Map<Integer, List<ExportRuleParamDto>> selectParamsByActiveRuleIds(DbSession dbSession, Collection<Integer> activeRuleIds) {
    return executeLargeInputs(activeRuleIds, ids -> mapper(dbSession).selectParamsByActiveRuleIds(ids))
      .stream()
      .collect(Collectors.groupingBy(ExportRuleParamDto::getActiveRuleId));
  }

  private static QualityProfileExportMapper mapper(DbSession dbSession) {
    return dbSession.getMapper(QualityProfileExportMapper.class);
  }
}
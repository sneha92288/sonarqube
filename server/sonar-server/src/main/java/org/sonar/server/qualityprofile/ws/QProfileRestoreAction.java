/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2014 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.server.qualityprofile.ws;

import com.google.common.base.Charsets;
import com.google.common.base.Preconditions;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.core.permission.GlobalPermissions;
import org.sonar.server.qualityprofile.QProfileBackuper;
import org.sonar.server.user.UserSession;

import java.io.InputStream;
import java.io.InputStreamReader;

public class QProfileRestoreAction implements BaseQProfileWsAction {

  private static final String PARAM_BACKUP = "backup";
  private final QProfileBackuper backuper;

  public QProfileRestoreAction(QProfileBackuper backuper) {
    this.backuper = backuper;
  }

  @Override
  public void handle(Request request, Response response) throws Exception {
    UserSession.get().checkLoggedIn().checkGlobalPermission(GlobalPermissions.QUALITY_PROFILE_ADMIN);
    InputStream backup = request.paramAsInputStream(PARAM_BACKUP);
    Preconditions.checkArgument(backup != null, "A backup file must be provided");

    backuper.restore(new InputStreamReader(backup, Charsets.UTF_8), null);
    response.noContent();
  }

  @Override
  public void define(WebService.NewController controller) {
    controller.createAction("restore")
      .setSince("5.2")
      .setDescription("Restore a quality profile using an XML file.")
      .setPost(true)
      .setHandler(this)
      .createParam(PARAM_BACKUP)
      .setDescription("A profile backup file in XML format, as generated by api/qualityprofiles/backup " +
        "or the former api/profiles/backup.");
  }

}

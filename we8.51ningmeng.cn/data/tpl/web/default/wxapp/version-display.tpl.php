<?php defined('IN_IA') or exit('Access Denied');?><?php (!empty($this) && $this instanceof WeModuleSite || 0) ? (include $this->template('common/header', TEMPLATE_INCLUDEPATH)) : (include template('common/header', TEMPLATE_INCLUDEPATH));?>
	<style>
		.account-rank img{width:20px; height:20px;}
		.alert{color:#666;padding:10px}
		.text-strong{font-size:14px;font-weight:bold;}
		.popover{max-width: 450px}
		.popover-content{padding-top: 0;line-height: 30px}
		.popover-content h5{padding-bottom: 5px}
	</style>
	<div class="panel panel-cut">
		<div class="panel-heading">
			<span class="panel-heading-left">选择版本</span>
			<a href="" class="panel-del" style="display:none;"><i class="fa fa-times"></i></a>
		</div>
		<div class="panel-body">
			<div class="wxapp-manage">
				<a href="<?php  echo url('wxapp/post/design_method', array('uniacid' => $_W['uniacid']))?>" class="color-default"><i class="wi wi-registersite"></i>新建版本</a>
			</div>
			<ul class="wxapp-cut-list">
				<?php  if(is_array($wxapp_version_list)) { foreach($wxapp_version_list as $list) { ?>
				<li class="wxapp-cut-item">
					<div class="wxapp-item-iphone">
						<img src="./resource/images/173.png"/>
						<div class="cover-dark">
							<a href="<?php  echo url('wxapp/version/home', array('version_id' => $list['id']))?>" class="manage-fa"><i class="fa fa-angle-right"></i></a>
							<a href="<?php  echo url('wxapp/version/home', array('version_id' => $list['id']))?>" class="manage">管理</a>
							<!-- <a href="" class="stick">置顶</a> -->
						</div>
					</div>
					<div class="wxapp-item-detail">
						<p class="color-dark"><?php  echo $list['version'];?></p>
						<p class="color-gray"><span><?php  echo $list['description'];?></span></p>
					</div>
				</li>
				<?php  } } ?>
			</ul>
		</div>
	</div>
</div>
<?php (!empty($this) && $this instanceof WeModuleSite || 0) ? (include $this->template('common/footer', TEMPLATE_INCLUDEPATH)) : (include template('common/footer', TEMPLATE_INCLUDEPATH));?>